"use client";
import { useEffect, useRef, useState } from "react";
import { BRAND as B } from "../lib/brand";

const W = 1080;
const H = { feed: 1350, story: 1920 };
const SAMPLE = {
  eyebrow: "Resinas compostas",
  headline: "Volte a sorrir com confiança.",
  pillars: ["Naturalidade", "Harmonia", "Qualidade"],
  tagline: "Um novo sorriso começa com cuidado e precisão.",
  cta: "Agende sua avaliação",
  caption: "",
  hashtags: [],
};

const gold = (c, x, y, w, h) => {
  const g = c.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, B.goldLight); g.addColorStop(0.55, B.gold); g.addColorStop(1, B.goldDark);
  return g;
};
const track = (c, t, x, y, sp) => { try { c.letterSpacing = sp + "px"; } catch {} c.fillText(t, x, y); try { c.letterSpacing = "0px"; } catch {} };
const wrap = (c, text, max) => {
  const out = []; let l = "";
  for (const w of text.split(" ")) {
    const t = l ? l + " " + w : w;
    if (c.measureText(t).width > max && l) { out.push(l); l = w; } else l = t;
  }
  if (l) out.push(l);
  return out;
};

function draw(canvas, { img, logo, format, d, focus }) {
  const story = format === "story", Hh = H[format];
  canvas.width = W; canvas.height = Hh;
  const c = canvas.getContext("2d");
  const bg = c.createRadialGradient(W / 2, Hh * 0.35, 80, W / 2, Hh * 0.5, Hh * 0.85);
  bg.addColorStop(0, "#102648"); bg.addColorStop(1, B.navyDeep);
  c.fillStyle = bg; c.fillRect(0, 0, W, Hh);
  c.strokeStyle = B.gold; c.lineWidth = 2; c.beginPath(); c.roundRect(36, 36, W - 72, Hh - 72, 30); c.stroke();
  c.textAlign = "center"; c.textBaseline = "alphabetic";

  // logo + nome
  let y = story ? 250 : 84;
  const lh = story ? 80 : 64;
  c.font = `500 ${story ? 44 : 38}px ${B.sans}`;
  const nameW = c.measureText(B.name).width;
  const lw = logo ? (lh * logo.width) / logo.height : 0;
  const x0 = (W - (lw + 18 + nameW)) / 2;
  if (logo) c.drawImage(logo, x0, y, lw, lh);
  c.fillStyle = B.cream; c.textAlign = "left";
  c.fillText(B.name, x0 + lw + 18, y + lh * 0.66);
  c.textAlign = "center";

  // eyebrow
  y += lh + (story ? 52 : 50);
  c.fillStyle = B.cream; c.font = `400 ${story ? 28 : 26}px ${B.sans}`;
  track(c, (d.eyebrow || "").toUpperCase(), W / 2, y, 7);
  c.fillStyle = gold(c, W / 2 - 40, y, 80, 2); c.fillRect(W / 2 - 40, y + 20, 80, 2);

  // headline
  y += 44;
  const hs = story ? 108 : 90;
  c.font = `600 ${hs}px ${B.serif}`; c.fillStyle = B.cream;
  const lines = wrap(c, d.headline || "", 900);
  lines.forEach((l, i) => c.fillText(l, W / 2, y + hs * 0.78 + i * hs * 1.04));
  const imgTop = y + lines.length * hs * 1.04 + 30;

  // rodapé (de baixo para cima)
  const ctaH = story ? 84 : 76, ctaY = Hh - (story ? 330 : 104) - ctaH;
  const tagY = ctaY - 36;
  const pilY = story ? tagY - 62 : null;
  const footTop = (pilY ?? tagY) - 36;
  const imgH = footTop - 24 - imgTop, imgX = 110, imgW = W - 220;

  // foto
  c.save(); c.beginPath(); c.roundRect(imgX, imgTop, imgW, imgH, 22); c.clip();
  if (img) {
    const s = Math.max(imgW / img.width, imgH / img.height), dw = img.width * s, dh = img.height * s;
    c.drawImage(img, imgX + (imgW - dw) / 2, imgTop + (imgH - dh) * focus, dw, dh);
  } else {
    c.fillStyle = "#0C2040"; c.fillRect(imgX, imgTop, imgW, imgH);
    c.fillStyle = B.goldLight; c.font = `300 32px ${B.sans}`; c.fillText("Sua imagem aparece aqui", W / 2, imgTop + imgH / 2);
  }
  c.restore();
  c.strokeStyle = gold(c, imgX, imgTop, imgW, imgH); c.lineWidth = 3;
  c.beginPath(); c.roundRect(imgX, imgTop, imgW, imgH, 22); c.stroke();

  // pilares (story)
  if (story && d.pillars?.length) {
    c.font = `400 30px ${B.sans}`; c.textAlign = "left";
    const parts = d.pillars.flatMap((p, i) => (i ? ["•", p] : [p]));
    const ws = parts.map((p) => c.measureText(p).width + (p === "•" ? 36 : 6));
    let x = (W - ws.reduce((a, b) => a + b, 0)) / 2;
    parts.forEach((p, i) => { c.fillStyle = p === "•" ? B.gold : B.cream; c.fillText(p, x + (p === "•" ? 18 : 0), pilY); x += ws[i]; });
    c.textAlign = "center";
  }

  // tagline
  const tag = d.tagline || "";
  let fs = 32; c.font = `300 ${fs}px ${B.sans}`;
  while (c.measureText(tag).width > 880 && fs > 20) { fs--; c.font = `300 ${fs}px ${B.sans}`; }
  c.fillStyle = B.cream; c.fillText(tag, W / 2, tagY);

  // CTA
  const cta = d.cta || "";
  c.font = `500 30px ${B.sans}`;
  const cw = c.measureText(cta).width + 130;
  c.fillStyle = gold(c, W / 2 - cw / 2, ctaY, cw, ctaH);
  c.beginPath(); c.roundRect(W / 2 - cw / 2, ctaY, cw, ctaH, ctaH / 2); c.fill();
  c.fillStyle = B.navyDeep; c.fillText(cta, W / 2, ctaY + ctaH / 2 + 10);

  // CRO
  if (B.cro) {
    c.fillStyle = B.goldLight; c.font = `300 20px ${B.sans}`;
    track(c, `${B.name} · ${B.cro}`, W / 2, story ? ctaY + ctaH + 50 : Hh - 66, 2);
  }
}

export default function Page() {
  const canvas = useRef(null);
  const [logo, setLogo] = useState(null);
  const [img, setImg] = useState(null);
  const [b64, setB64] = useState("");
  const [format, setFormat] = useState("feed");
  const [brief, setBrief] = useState("");
  const [focus, setFocus] = useState(0.5);
  const [d, setD] = useState(SAMPLE);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { const i = new Image(); i.onload = () => setLogo(i); i.src = "/logo-gold.png"; }, []);

  useEffect(() => {
    let off = false;
    Promise.all([
      document.fonts.load(`600 90px 'Cormorant Garamond'`),
      ...[300, 400, 500].map((w) => document.fonts.load(`${w} 30px Jost`)),
    ]).then(() => { if (!off && canvas.current) draw(canvas.current, { img, logo, format, d, focus }); });
    return () => { off = true; };
  }, [img, logo, format, d, focus]);

  const onFile = (f) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => {
        setImg(i);
        const k = Math.min(1, 1024 / Math.max(i.width, i.height)), t = document.createElement("canvas");
        t.width = i.width * k; t.height = i.height * k;
        t.getContext("2d").drawImage(i, 0, 0, t.width, t.height);
        setB64(t.toDataURL("image/jpeg", 0.85).split(",")[1]);
      };
      i.src = r.result;
    };
    r.readAsDataURL(f);
  };

  // Manus: cria a tarefa e consulta a cada 3s até o resultado ficar pronto
  const generate = async () => {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64, mime: "image/jpeg", format, brief }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);

      let out = { ready: false };
      for (let i = 0; i < 60 && !out.ready; i++) { // até ~3 minutos
        await new Promise((r) => setTimeout(r, 3000));
        const s = await fetch(`/api/generate?task_id=${j.task_id}`);
        out = await s.json();
        if (!s.ok) throw new Error(out.error);
      }
      if (!out.ready) throw new Error("O Manus demorou demais. Tente de novo.");
      setD({ ...SAMPLE, ...out.result }); setNotes(out.result.notes || "");
    } catch (e) { setErr(e.message || "Erro ao gerar."); }
    setBusy(false);
  };

  const download = () => canvas.current.toBlob((b) => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(b);
    a.download = `post-${format}-${Date.now()}.png`; a.click();
  });
  const copy = () => navigator.clipboard.writeText(`${d.caption}\n\n${(d.hashtags || []).join(" ")}`);
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });

  return (
    <main className="wrap">
      <header>
        <img src="/logo-gold.png" alt="" />
        <div><h1>{B.name}</h1><p>Central de posts</p></div>
      </header>

      <div className="grid">
        <section className="panel">
          <label>Imagem
            <div className="drop" tabIndex={0} onClick={() => document.getElementById("f").click()}
              onKeyDown={(e) => e.key === "Enter" && document.getElementById("f").click()}>
              {img ? <img src={img.src} alt="Prévia" /> : "Clique para enviar a foto do caso"}
            </div>
            <input id="f" type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files[0])} />
          </label>

          <div className="seg" role="group" aria-label="Formato">
            <button aria-pressed={format === "feed"} onClick={() => setFormat("feed")}>Feed 4:5</button>
            <button aria-pressed={format === "story"} onClick={() => setFormat("story")}>Story 9:16</button>
          </div>

          <label>O que você quer no post?
            <textarea rows={5} value={brief} onChange={(e) => setBrief(e.target.value)}
              placeholder="Ex.: Caso de resina composta nos incisivos. Legenda educativa sobre manutenção, tom acolhedor. Arte sóbria, foco no sorriso." />
          </label>

          <label>Enquadramento da foto
            <input type="range" min="0" max="1" step="0.01" value={focus} onChange={(e) => setFocus(+e.target.value)} />
          </label>

          <button className="btn" onClick={generate} disabled={busy}>{busy ? "Criando… (pode levar alguns minutos)" : "Gerar post"}</button>
          {err && <p className="err" role="alert">{err}</p>}
        </section>

        <section className="stage">
          <canvas ref={canvas} aria-label="Prévia do post" />
          <div className="row">
            <button className="btn" onClick={download}>Baixar PNG</button>
            <button className="btn ghost" onClick={copy}>Copiar legenda</button>
          </div>
          <div className="out panel">
            {notes && <p className="note">{notes}</p>}
            <label>Chamada<input type="text" value={d.eyebrow || ""} onChange={set("eyebrow")} /></label>
            <label>Título<input type="text" value={d.headline || ""} onChange={set("headline")} /></label>
            <label>Frase de apoio<input type="text" value={d.tagline || ""} onChange={set("tagline")} /></label>
            <label>Botão<input type="text" value={d.cta || ""} onChange={set("cta")} /></label>
            <label>Legenda<textarea rows={8} value={d.caption || ""} onChange={set("caption")} /></label>
            <label>Hashtags
              <input type="text" value={(d.hashtags || []).join(" ")} onChange={(e) => setD({ ...d, hashtags: e.target.value.split(" ") })} />
            </label>
          </div>
        </section>
      </div>
    </main>
  );
}