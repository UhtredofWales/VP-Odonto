"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Aba "Logo nas Imagens"                                             */
/*  Sobe fotos, aplica a logo no canto direito e baixa o resultado.    */
/*  Tudo roda no navegador (canvas): nenhuma chamada de API/IA.        */
/* ------------------------------------------------------------------ */

const DEFAULT_LOGO = "/logo-gold.png"; // arquivo que já existe em /public
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
    ctx.fillStyle = logoIsLight ? "rgba(4,10,23,0.82)" : "rgba(255,255,255,0.88)";
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
          <button type="button" className="btn" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={download} disabled={!logo}>
            Baixar
          </button>
          <button type="button" className="btn ghost" onClick={() => onRemove(item.id)}>
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
  const urls = useRef(new Set());

  const applyLogo = useCallback(async (src) => {
    const img = await loadImage(src);
    setLogo({ img, lum: logoLuminance(img) });
  }, []);

  // Carrega a logo enviada antes; se não houver, usa /logo-gold.png
  useEffect(() => {
    let alive = true;
    (async () => {
      let saved = null;
      try {
        saved = window.localStorage.getItem(STORAGE_KEY);
      } catch {}
      try {
        await applyLogo(saved || DEFAULT_LOGO);
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

  async function resetLogo() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    try {
      await applyLogo(DEFAULT_LOGO);
    } catch {
      setLogo(null);
    }
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
    <div className="grid lt-root">
      <style>{css}</style>

      <div className="panel">
        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--gold)" }}>
          Aplicar a logo no canto direito das imagens, sem gerar post:
        </span>

        <div className="lt-logo-box">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.img.src} alt="Logo atual" />
          ) : (
            <span className="lt-muted">Nenhuma logo carregada</span>
          )}
          <div className="lt-actions">
            <label className="btn ghost lt-file">
              Trocar logo
              <input
                type="file"
                accept="image/png,image/svg+xml,image/webp,image/jpeg"
                hidden
                onChange={(e) => {
                  onLogoFile(e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <button type="button" className="btn ghost" onClick={resetLogo}>
              Usar logo padrão
            </button>
          </div>
        </div>

        <label>
          Posição
          <select value={opts.position} onChange={set("position")}>
            {POSITIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>
            Tamanho <span className="lt-val">{opts.size}%</span>
          </span>
          <input type="range" min="8" max="35" value={opts.size} onChange={set("size")} />
        </label>

        <label>
          <span>
            Distância da borda <span className="lt-val">{opts.margin}%</span>
          </span>
          <input type="range" min="1" max="10" value={opts.margin} onChange={set("margin")} />
        </label>

        <label>
          <span>
            Opacidade <span className="lt-val">{opts.opacity}%</span>
          </span>
          <input type="range" min="50" max="100" value={opts.opacity} onChange={set("opacity")} />
        </label>

        <label>
          Proteção de leitura
          <select value={opts.protection} onChange={set("protection")}>
            {PROTECTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <small className="lt-muted">
            Automática mede o fundo atrás da logo e escolhe entre nada, sombra suave ou placa escura.
          </small>
        </label>

        <label>
          Formato do arquivo
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="png">PNG (sem perda)</option>
            <option value="jpg">JPG (arquivo menor)</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: "5px", fontSize: "13px", color: "var(--gold-l)" }}>
          Imagens
          <div
            className="drop"
            style={{
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              minHeight: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "10px",
            }}
          >
            {items.length > 0 ? (
              <span>{items.length} imagem(ns) anexada(s). Toque para adicionar mais.</span>
            ) : (
              <span>Toque ou arraste aqui as imagens que vão receber a logo</span>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
                zIndex: 10,
              }}
            />
          </div>
        </label>

        {error && (
          <p className="lt-error" role="alert">
            {error}
          </p>
        )}

        <button type="button" className="btn" onClick={downloadAll} disabled={!logo || !items.length || busy}>
          {busy ? "Baixando..." : "⬇️ Baixar todas com a logo"}
        </button>
      </div>

      <div className="lt-results">
        {items.length === 0 ? (
          <div className="lt-empty">Anexe as imagens para ver a logo aplicada no canto direito</div>
        ) : (
          items.map((item) => (
            <Result key={item.id} item={item} logo={logo} opts={opts} format={format} onRemove={removeItem} />
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------ estilo ------------------------------ */

const css = `
.lt-root input[type=range]{padding:0;border:0;background:transparent;accent-color:var(--gold,#c8a86b);width:100%}
.lt-root label > span:first-child{display:flex;justify-content:space-between}
.lt-val{color:var(--gold-l,#e6cf9d);font-weight:600}
.lt-muted{color:var(--gold-d,#9c7f46);font-size:11px;line-height:1.4}
.lt-logo-box{display:grid;gap:10px;justify-items:center;padding:12px;border:1px dashed var(--gold-d,#9c7f46);border-radius:10px;background:repeating-conic-gradient(#0b1b36 0% 25%,#071328 0% 50%) 50%/16px 16px}
.lt-logo-box img{max-width:100%;max-height:72px;object-fit:contain}
.lt-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.lt-file{cursor:pointer}
.lt-error{margin:0;color:#ff9b9b;font-size:12px}
.lt-results{display:grid;gap:14px;align-content:start;width:100%}
.lt-card{margin:0;border:1px solid var(--gold-d,#9c7f46);border-radius:12px;overflow:hidden;background:#071328}
.lt-canvas{background:#040a17}
.lt-cap{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px}
.lt-name{font-size:12px;color:var(--gold-l,#e6cf9d);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.lt-empty{display:grid;place-items:center;min-height:320px;padding:24px;border:1px solid var(--gold-d,#9c7f46);border-radius:12px;background:#071328;color:var(--gold-d,#9c7f46);font-size:12px;text-align:center}
`;