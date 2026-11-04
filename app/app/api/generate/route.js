import { NextResponse } from "next/server";

const BASE = "https://api.manus.ai/v2";
const headers = () => ({ "Content-Type": "application/json", "x-manus-api-key": process.env.MANUS_API_KEY });

const SYSTEM = `Você é o diretor de conteúdo de um consultório odontológico premium no Brasil: cirurgião-dentista com olhar de social media sênior.
Seu tom: sofisticado, sereno, preciso e humano. Português do Brasil. Nada de gíria, exagero ou apelo vendedor.

REGRAS ÉTICAS (CFO, publicidade odontológica) — sempre obedeça:
- Nunca prometa resultado, garantia, "o melhor", "o mais barato", "milagre", nem compare com colegas.
- Nunca divulgue preço, promoção, sorteio ou parcelamento.
- Nunca faça diagnóstico ou prescrição pela imagem. Se a imagem for caso clínico, trate como "caso ilustrativo, resultados variam de pessoa para pessoa" e lembre que há autorização do paciente.
- Conteúdo educativo, com linguagem clara; termos técnicos só quando ajudam, sempre explicados.
- Chamada para ação suave: avaliação, conversa, cuidado contínuo.

COMO TRABALHAR:
1. Observe a imagem anexada (procedimento provável, enquadramento, luz) e leia o pedido.
2. Headline curta e elegante (3 a 7 palavras, termina com ponto final), sem clichê.
3. Legenda para Instagram: gancho na 1ª linha, valor educativo em 3 a 6 frases curtas, benefício realista (sem promessa), CTA, quebras de linha. Feed: até ~900 caracteres. Story: até 200.
4. Hashtags: 8 a 12, mistas (procedimento, região se informada, odontologia), sem repetição.
5. NÃO pesquise na web, NÃO crie arquivos, sites ou slides. Apenas escreva o resultado final no esquema pedido.`;

const str = { type: "string" };
const SCHEMA = {
  type: "object",
  properties: {
    eyebrow: { ...str, description: "procedimento em 1 a 3 palavras" },
    headline: str,
    pillars: { type: "array", items: str },
    tagline: str,
    cta: { ...str, description: "2 a 4 palavras" },
    caption: { ...str, description: "legenda completa, sem hashtags" },
    hashtags: { type: "array", items: str },
    altText: str,
    notes: { ...str, description: "1 a 2 frases: enquadramento ou cuidado ético" },
  },
  required: ["eyebrow", "headline", "pillars", "tagline", "cta", "caption", "hashtags", "altText", "notes"],
  additionalProperties: false,
};

// percorre qualquer formato de resposta e acha o primeiro objeto que bate
const find = (o, pred) => {
  if (!o || typeof o !== "object") return null;
  if (pred(o)) return o;
  for (const v of Object.values(o)) { const r = find(v, pred); if (r) return r; }
  return null;
};

export async function POST(req) {
  if (!process.env.MANUS_API_KEY) return NextResponse.json({ error: "Falta MANUS_API_KEY (.env.local ou Vercel)." }, { status: 500 });
  const { image, mime, format, brief } = await req.json();

  const content = [{
    type: "text",
    text: `${SYSTEM}\n\nFormato do post: ${format === "story" ? "STORY (vertical 9:16)" : "FEED (4:5)"}.\nPedido: ${brief || "Crie o post ideal para esta imagem."}`,
  }];
  if (image) content.push({ type: "file", file_data: `data:${mime || "image/jpeg"};base64,${image}`, filename: "caso.jpg", mime_type: mime || "image/jpeg" });

  const r = await fetch(`${BASE}/task.create`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      message: { content },
      structured_output_schema: SCHEMA,
      agent_profile: process.env.MANUS_PROFILE || "lite",
      hide_in_task_list: true,
      locale: "pt-BR",
    }),
  });
  const j = await r.json();
  if (!r.ok || !j.task_id) return NextResponse.json({ error: j?.error?.message || "Falha ao criar a tarefa no Manus." }, { status: r.status || 502 });
  return NextResponse.json({ task_id: j.task_id });
}

export async function GET(req) {
  const id = new URL(req.url).searchParams.get("task_id");
  if (!id) return NextResponse.json({ error: "task_id ausente." }, { status: 400 });

  const r = await fetch(`${BASE}/task.listMessages?task_id=${encodeURIComponent(id)}&order=desc&limit=20`, { headers: headers() });
  const data = await r.json();
  if (!r.ok) return NextResponse.json({ error: data?.error?.message || "Falha ao consultar o Manus." }, { status: r.status });

  const so = find(data, (o) => o.type === "structured_output_result" && o.structured_output_result);
  if (so) {
    const x = so.structured_output_result;
    if (x.success) return NextResponse.json({ ready: true, result: x.value });
    return NextResponse.json({ error: x.error || "O Manus não conseguiu montar o resultado." }, { status: 502 });
  }
  const bad = find(data, (o) => o.agent_status === "error");
  if (bad) return NextResponse.json({ error: bad.error_message || "A tarefa falhou no Manus." }, { status: 502 });

  return NextResponse.json({ ready: false });
}