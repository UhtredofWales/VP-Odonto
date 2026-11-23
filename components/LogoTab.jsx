"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Aba "Logo nas imagens"                                             */
/*  Sobe fotos, aplica a logo no canto direito e baixa o resultado.    */
/*  Tudo roda no navegador (canvas): nenhuma chamada de API/IA.        */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "logo-tab:logo";
const PREVIEW_DIM = 900; // lado maior da pré-visualização
const EXPORT_DIM = 6000; // teto do arquivo final (mantém a resolução original abaixo disso)

const POSITIONS = [
  { id: "bottom-right", label: "Inferior direito" },
  { id: "top-right", label: "Superior direito" },
];

const PROTECTIONS = [
  { id: "auto", label: "Automática" },
  { id: "none", label: "Nenhuma" },
  { id: "shadow", label: "Sombra suave" },
  { id: "plate", label: "Placa translúcida" },
];

/* ----------------------------- helpers ----------------------------- */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível abrir a imagem."));
    img.src = src;
  });
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

// Luminância média (0–255) da logo, ponderada pela opacidade de cada pixel.
function logoLuminance(img) {
  const w = 64;
  const h = Math.max(1, Math.round((w * img.naturalHeight) / img.naturalWidth));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  let sum = 0;
  let weight = 0;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255;
    if (a < 0.1) continue;
    sum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) * a;
    weight += a;
  }
  return weight ? sum / weight : 128;
}

// Média e variação de luminância da área onde a logo vai ficar.
function regionStats(canvas, x, y, w, h) {
  const sx = Math.max(0, Math.floor(x));
  const sy = Math.max(0, Math.floor(y));
  const sw = Math.max(1, Math.min(canvas.width - sx, Math.ceil(w)));
  const sh = Math.max(1, Math.min(canvas.height - sy, Math.ceil(h)));
  const s = document.createElement("canvas");
  s.width = 32;
  s.height = 32;
  const ctx = s.getContext("2d");
  ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, 32, 32);
  const d = ctx.getImageData(0, 0, 32, 32).data;
  const lum = [];
  for (let i = 0; i < d.length; i += 4) {
    lum.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
  }
  const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
  const variance = lum.reduce((a, b) => a + (b - mean) ** 2, 0) / lum.length;
  return { mean, std: Math.sqrt(variance) };
}

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Desenha a foto e aplica a logo. Todas as medidas são proporcionais à
// largura da imagem, então a prévia e o arquivo final ficam idênticos.
function composite(photo, logo, o, maxDim) {
  const scale = Math.min(1, maxDim / Math.max(photo.naturalWidth, photo.naturalHeight));
  const w = Math.round(photo.naturalWidth * scale);
  const h = Math.round(photo.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(photo, 0, 0, w, h);
  if (!logo) return canvas;

  const ratio = logo.img.naturalWidth / logo.img.naturalHeight;
  let lw = (w * o.size) / 100;
  let lh = lw / ratio;
  const maxH = h * 0.22; // logo nunca ocupa mais que 22% da altura
  if (lh > maxH) {
    lh = maxH;
    lw = lh * ratio;
  }

  const margin = (w * o.margin) / 100;
  const pad = lw * 0.14;
  const top = o.position === "top-right";

  let x = w - margin - lw;
  let y = top ? margin : h - margin - lh;

  let mode = o.protection;
  if (mode === "auto") {
    const st = regionStats(canvas, x - pad, y - pad, lw + 2 * pad, lh + 2 * pad);
    const contrast = Math.abs(st.mean - logo.lum);
    mode = contrast < 50 ? "plate" : st.std > 48 ? "shadow" : "none";
  }

  if (mode === "plate") {
    // a placa respeita a mesma margem; a logo entra recuada pelo padding
    x = w - margin - pad - lw;
    y = top ? margin + pad : h - margin - pad - lh;
    const logoIsLight = logo.lum > 128;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = pad * 0.9;
    ctx.shadowOffsetY = pad * 0.2;
    ctx.fillStyle = logoIsLight ? "rgba(12,24,48,0.80)" : "rgba(255,255,255,0.88)";
    roundedRect(ctx, x - pad, y - pad, lw + 2 * pad, lh + 2 * pad, pad * 1.1);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = o.opacity / 100;
  if (mode === "shadow") {
    ctx.shadowColor = "rgba(0,0,0,0.38)";
    ctx.shadowBlur = lw * 0.05;
    ctx.shadowOffsetY = lw * 0.012;
  }
  ctx.drawImage(logo.img, x, y, lw, lh);
  ctx.restore();

  return canvas;
}

function exportBlob(item, logo, opts, format) {
  const canvas = composite(item.img, logo, opts, EXPORT_DIM);
  const type = format === "jpg" ? "image/jpeg" : "image/png";
  return new Promise((resolve) => canvas.toBlob(resolve, type, 0.95));
}

function saveBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

function outputName(name, format) {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}-logo.${format}`;
}

/* ----------------------------- resultado ---------------------------- */

function Result({ item, logo, opts, format, onRemove }) {
  const host = useRef(null);

  useEffect(() => {
    if (!host.current) return;
    const canvas = composite(item.img, logo, opts, PREVIEW_DIM);
    canvas.style.cssText = "width:100%;height:auto;display:block";
    host.current.replaceChildren(canvas);
  }, [item, logo, opts]);

  async function download() {
    const blob = await exportBlob(item, logo, opts, format);
    if (blob) saveBlob(blob, outputName(item.name, format));
  }

  return (
    <figure className="lt-card">
      <div className="lt-canvas" ref={host} />
      <figcaption className="lt-cap">
        <span className="lt-name" title={item.name}>
          {item.name}
        </span>
        <span className="lt-actions">
          <button type="button" className="lt-btn lt-btn-gold" onClick={download} disabled={!logo}>
            Baixar
          </button>
          <button type="button" className="lt-btn" onClick={() => onRemove(item.id)}>
            Remover
          </button>
        </span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------ aba -------------------------------- */

export default function LogoTab() {
  const [logo, setLogo] = useState(null); // { img, lum }
  const [items, setItems] = useState([]); // { id, name, url, img }
  const [opts, setOpts] = useState({
    position: "bottom-right",
    size: 18,
    margin: 4,
    opacity: 100,
    protection: "auto",
  });
  const [format, setFormat] = useState("png");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const urls = useRef(new Set());

  const applyLogo = useCallback(async (src) => {
    const img = await loadImage(src);
    setLogo({ img, lum: logoLuminance(img) });
  }, []);

  // Carrega a logo salva no navegador; se não houver, tenta /public/logo.png
  useEffect(() => {
    let alive = true;
    (async () => {
      let saved = null;
      try {
        saved = window.localStorage.getItem(STORAGE_KEY);
      } catch {}
      try {
        if (saved) await applyLogo(saved);
        else await applyLogo("/logo.png");
      } catch {
        if (alive) setLogo(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [applyLogo]);

  useEffect(() => {
    const set = urls.current;
    return () => set.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  async function onLogoFile(file) {
    if (!file) return;
    setError("");
    try {
      const src = await readAsDataURL(file);
      await applyLogo(src);
      try {
        window.localStorage.setItem(STORAGE_KEY, src);
      } catch {}
    } catch (e) {
      setError(e.message);
    }
  }

  function clearLogo() {
    setLogo(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  async function addPhotos(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) {
      setError("Escolha arquivos de imagem (JPG, PNG ou WebP).");
      return;
    }
    setError("");
    const added = [];
    const failed = [];
    for (const f of files) {
      const url = URL.createObjectURL(f);
      try {
        const img = await loadImage(url);
        urls.current.add(url);
        added.push({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`, name: f.name, url, img });
      } catch {
        URL.revokeObjectURL(url);
        failed.push(f.name);
      }
    }
    if (added.length) setItems((prev) => [...prev, ...added]);
    if (failed.length) setError(`Não consegui abrir: ${failed.join(", ")}. Formatos como HEIC precisam ser convertidos antes.`);
  }

  function removeItem(id) {
    setItems((prev) => {
      const gone = prev.find((i) => i.id === id);
      if (gone) {
        URL.revokeObjectURL(gone.url);
        urls.current.delete(gone.url);
      }
      return prev.filter((i) => i.id !== id);
    });
  }

  async function downloadAll() {
    if (!logo || !items.length) return;
    setBusy(true);
    for (const item of items) {
      const blob = await exportBlob(item, logo, opts, format);
      if (blob) saveBlob(blob, outputName(item.name, format));
      await new Promise((r) => setTimeout(r, 300));
    }
    setBusy(false);
  }

  const set = (key) => (e) =>
    setOpts((o) => ({ ...o, [key]: e.target.type === "range" ? Number(e.target.value) : e.target.value }));

  return (
    <section className="lt-root">
      <style>{css}</style>

      <header className="lt-head">
        <h2>Logo nas imagens</h2>
        <p>Suba as fotos e a logo entra no canto direito, sem gerar post nem legenda.</p>
      </header>

      <div className="lt-layout">
        <aside className="lt-panel">
          <div className="lt-group">
            <span className="lt-label">Logo</span>
            {logo ? (
              <div className="lt-logo-box">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.img.src} alt="Logo atual" />
                <div className="lt-actions">
                  <label className="lt-btn">
                    Trocar
                    <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" hidden onChange={(e) => onLogoFile(e.target.files[0])} />
                  </label>
                  <button type="button" className="lt-btn" onClick={clearLogo}>
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <label className="lt-btn lt-btn-gold lt-block">
                Enviar logo (PNG com fundo transparente)
                <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" hidden onChange={(e) => onLogoFile(e.target.files[0])} />
              </label>
            )}
          </div>

          <div className="lt-group">
            <label className="lt-label" htmlFor="lt-pos">Posição</label>
            <select id="lt-pos" value={opts.position} onChange={set("position")}>
              {POSITIONS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="lt-group">
            <label className="lt-label" htmlFor="lt-size">
              Tamanho <b>{opts.size}%</b>
            </label>
            <input id="lt-size" type="range" min="8" max="35" value={opts.size} onChange={set("size")} />
          </div>

          <div className="lt-group">
            <label className="lt-label" htmlFor="lt-margin">
              Distância da borda <b>{opts.margin}%</b>
            </label>
            <input id="lt-margin" type="range" min="1" max="10" value={opts.margin} onChange={set("margin")} />
          </div>

          <div className="lt-group">
            <label className="lt-label" htmlFor="lt-opacity">
              Opacidade <b>{opts.opacity}%</b>
            </label>
            <input id="lt-opacity" type="range" min="50" max="100" value={opts.opacity} onChange={set("opacity")} />
          </div>

          <div className="lt-group">
            <label className="lt-label" htmlFor="lt-prot">Proteção de leitura</label>
            <select id="lt-prot" value={opts.protection} onChange={set("protection")}>
              {PROTECTIONS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <small>Automática mede o fundo atrás da logo e escolhe sozinha entre nada, sombra ou placa.</small>
          </div>

          <div className="lt-group">
            <label className="lt-label" htmlFor="lt-format">Formato do arquivo</label>
            <select id="lt-format" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="png">PNG (sem perda)</option>
              <option value="jpg">JPG (arquivo menor)</option>
            </select>
          </div>
        </aside>

        <div className="lt-main">
          <label
            className={`lt-drop${dragging ? " is-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addPhotos(e.dataTransfer.files);
            }}
          >
            <strong>Arraste as imagens aqui ou clique para escolher</strong>
            <span>Pode enviar várias de uma vez. O arquivo final mantém a resolução original.</span>
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          {error && <p className="lt-error" role="alert">{error}</p>}
          {!logo && items.length > 0 && (
            <p className="lt-error" role="alert">Envie a logo para aplicar nas imagens.</p>
          )}

          {items.length > 0 && (
            <>
              <div className="lt-bar">
                <span>{items.length} {items.length === 1 ? "imagem" : "imagens"}</span>
                <button type="button" className="lt-btn lt-btn-gold" onClick={downloadAll} disabled={!logo || busy}>
                  {busy ? "Baixando…" : "Baixar todas"}
                </button>
              </div>
              <div className="lt-grid">
                {items.map((item) => (
                  <Result key={item.id} item={item} logo={logo} opts={opts} format={format} onRemove={removeItem} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ estilo ------------------------------ */

const css = `
.lt-root{--lt-navy:var(--navy,#0e2240);--lt-gold:var(--gold,#c9a24b);--lt-ink:#1b2433;--lt-line:#d9dde5;--lt-soft:#f5f6f9;color:var(--lt-ink);max-width:1200px;margin:0 auto;padding:24px 16px 56px}
.lt-head h2{margin:0 0 4px;font-size:1.5rem;color:var(--lt-navy)}
.lt-head p{margin:0 0 24px;color:#5a6577}
.lt-layout{display:grid;grid-template-columns:280px 1fr;gap:28px;align-items:start}
.lt-panel{display:flex;flex-direction:column;gap:18px;padding:20px;border:1px solid var(--lt-line);border-radius:10px;background:#fff;position:sticky;top:16px}
.lt-group{display:flex;flex-direction:column;gap:6px}
.lt-label{font-size:.85rem;font-weight:600;color:var(--lt-navy);display:flex;justify-content:space-between}
.lt-label b{font-weight:600;color:#5a6577}
.lt-group small{color:#6b7587;font-size:.78rem;line-height:1.35}
.lt-root select{padding:8px 10px;border:1px solid var(--lt-line);border-radius:6px;background:#fff;font:inherit}
.lt-root input[type=range]{accent-color:var(--lt-gold);width:100%}
.lt-logo-box{display:flex;flex-direction:column;gap:10px;padding:12px;border:1px dashed var(--lt-line);border-radius:8px;background:repeating-conic-gradient(#eef0f4 0% 25%,#fff 0% 50%) 50%/16px 16px}
.lt-logo-box img{max-width:100%;max-height:72px;object-fit:contain;align-self:center}
.lt-btn{display:inline-flex;align-items:center;justify-content:center;padding:8px 14px;border:1px solid var(--lt-navy);border-radius:6px;background:#fff;color:var(--lt-navy);font:inherit;font-size:.88rem;cursor:pointer}
.lt-btn:hover:not(:disabled){background:var(--lt-soft)}
.lt-btn:focus-visible,.lt-root select:focus-visible,.lt-root input[type=range]:focus-visible{outline:2px solid var(--lt-gold);outline-offset:2px}
.lt-btn:disabled{opacity:.5;cursor:not-allowed}
.lt-btn-gold{background:var(--lt-navy);border-color:var(--lt-navy);color:#fff}
.lt-btn-gold:hover:not(:disabled){background:#173363}
.lt-block{width:100%;text-align:center}
.lt-actions{display:flex;gap:8px}
.lt-drop{display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;text-align:center;padding:36px 20px;border:2px dashed var(--lt-line);border-radius:12px;background:var(--lt-soft);cursor:pointer;color:var(--lt-navy)}
.lt-drop span{color:#5a6577;font-size:.88rem}
.lt-drop:hover,.lt-drop.is-over{border-color:var(--lt-gold);background:#fbf7ec}
.lt-error{margin:12px 0 0;color:#a32727;font-size:.9rem}
.lt-bar{display:flex;justify-content:space-between;align-items:center;margin:22px 0 12px;color:#5a6577}
.lt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.lt-card{margin:0;border:1px solid var(--lt-line);border-radius:10px;overflow:hidden;background:#fff}
.lt-canvas{background:#e9ecf1}
.lt-cap{display:flex;flex-direction:column;gap:8px;padding:10px 12px}
.lt-name{font-size:.82rem;color:#5a6577;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:820px){.lt-layout{grid-template-columns:1fr}.lt-panel{position:static}}
`;