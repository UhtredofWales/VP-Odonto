'use client';

import { useState, useRef } from 'react';
import { BRAND, DENTAL_CASES, FORMAT_OPTIONS } from '../lib/brand';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState(DENTAL_CASES[0].id);
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[2].id);
  const [selectedImages, setSelectedImages] = useState([]);
  const [useBeforeAfter, setUseBeforeAfter] = useState(true);

  // Índices para navegação de todas as seções
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [topCaptionIndex, setTopCaptionIndex] = useState(0);
  const [valuesIndex, setValuesIndex] = useState(0);
  const [postCaptionIndex, setPostCaptionIndex] = useState(0);

  const currentCaseObj = DENTAL_CASES.find(c => c.id === selectedCase) || DENTAL_CASES[0];

  // Campos Totalmente Editáveis
  const [customCategory, setCustomCategory] = useState(currentCaseObj.categoryTitle);
  const [customTopCaption, setCustomTopCaption] = useState(currentCaseObj.topCaptions[0]);
  const [customValuesLine, setCustomValuesLine] = useState("Naturalidade · Harmonia · Qualidade");
  const [customPostCaption, setCustomPostCaption] = useState(currentCaseObj.postCaptions[0]);
  const [customCta, setCustomCta] = useState("Agende sua avaliação");

  // Contexto para a IA Especializada
  const [patientContext, setPatientContext] = useState('');
  const [procedureHighlights, setProcedureHighlights] = useState('');

  // Estados de Renderização e Download
  const [isRendering, setIsRendering] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [renderedImageUrl, setRenderedImageUrl] = useState(null);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentFormatObj = FORMAT_OPTIONS.find(f => f.id === selectedFormat) || FORMAT_OPTIONS[2];

  const handleCaseChange = (e) => {
    const newCaseId = e.target.value;
    setSelectedCase(newCaseId);
    setCategoryIndex(0);
    setTopCaptionIndex(0);
    setValuesIndex(0);
    setPostCaptionIndex(0);
    
    const newObj = DENTAL_CASES.find(c => c.id === newCaseId);
    setCustomCategory(newObj.categoryTitle);
    setCustomTopCaption(newObj.topCaptions[0]);
    setCustomValuesLine("Naturalidade · Harmonia · Qualidade");
    setCustomPostCaption(newObj.postCaptions[0]);
  };

  const prevCategory = () => {
    const cats = [currentCaseObj.categoryTitle, "EXCELÊNCIA EM ODONTOLOGIA", "ESTÉTICA E FUNCIONALIDADE", "TRANSFORMAÇÃO DE SORRISOS"];
    const nextIdx = categoryIndex === 0 ? cats.length - 1 : categoryIndex - 1;
    setCategoryIndex(nextIdx);
    setCustomCategory(cats[nextIdx]);
  };
  const nextCategory = () => {
    const cats = [currentCaseObj.categoryTitle, "EXCELÊNCIA EM ODONTOLOGIA", "ESTÉTICA E FUNCIONALIDADE", "TRANSFORMAÇÃO DE SORRISOS"];
    const nextIdx = categoryIndex === cats.length - 1 ? 0 : categoryIndex + 1;
    setCategoryIndex(nextIdx);
    setCustomCategory(cats[nextIdx]);
  };

  const prevTopCaption = () => {
    const nextIdx = topCaptionIndex === 0 ? currentCaseObj.topCaptions.length - 1 : topCaptionIndex - 1;
    setTopCaptionIndex(nextIdx);
    setCustomTopCaption(currentCaseObj.topCaptions[nextIdx]);
  };
  const nextTopCaption = () => {
    const nextIdx = topCaptionIndex === currentCaseObj.topCaptions.length - 1 ? 0 : topCaptionIndex + 1;
    setTopCaptionIndex(nextIdx);
    setCustomTopCaption(currentCaseObj.topCaptions[nextIdx]);
  };

  const prevValues = () => {
    const vals = ["Naturalidade · Harmonia · Qualidade", "Precisão · Tecnologia · Conforto", "Segurança · Estética · Durabilidade", "Arte · Ciência · Sofisticação"];
    const nextIdx = valuesIndex === 0 ? vals.length - 1 : valuesIndex - 1;
    setValuesIndex(nextIdx);
    setCustomValuesLine(vals[nextIdx]);
  };
  const nextValues = () => {
    const vals = ["Naturalidade · Harmonia · Qualidade", "Precisão · Tecnologia · Conforto", "Segurança · Estética · Durabilidade", "Arte · Ciência · Sofisticação"];
    const nextIdx = valuesIndex === vals.length - 1 ? 0 : valuesIndex + 1;
    setValuesIndex(nextIdx);
    setCustomValuesLine(vals[nextIdx]);
  };

  const prevPostCaption = () => {
    const nextIdx = postCaptionIndex === 0 ? currentCaseObj.postCaptions.length - 1 : postCaptionIndex - 1;
    setPostCaptionIndex(nextIdx);
    setCustomPostCaption(currentCaseObj.postCaptions[nextIdx]);
  };
  const nextPostCaption = () => {
    const nextIdx = postCaptionIndex === currentCaseObj.postCaptions.length - 1 ? 0 : postCaptionIndex + 1;
    setPostCaptionIndex(nextIdx);
    setCustomPostCaption(currentCaseObj.postCaptions[nextIdx]);
  };

  // Leitura assíncrona robusta compatível com iOS / Safari
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const loadedImages = await Promise.all(
        files.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (evt) => resolve({ url: evt.target.result });
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
          });
        })
      );

      setSelectedImages(prev => [...prev, ...loadedImages]);
    } catch (err) {
      console.error("Erro ao carregar no iOS:", err);
      alert("Erro ao ler imagem no dispositivo. Tente novamente.");
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAIGenerateText = () => {
    if (!patientContext.trim() && !procedureHighlights.trim()) {
      alert('Por favor, preencha ao menos um campo de contexto para a IA gerar de acordo!');
      return;
    }

    const refinedTop = patientContext.trim() 
      ? `Transformação estética focada em ${patientContext.trim()}.` 
      : `Excelência e precisão em ${currentCaseObj.label.toLowerCase()}.`;

    const refinedPost = procedureHighlights.trim() 
      ? `${procedureHighlights.trim()}. Devolva a harmonia e a jovialidade ao seu sorriso com segurança e planejamento digital.` 
      : `Planejamento reabilitador personalizado para garantir naturalidade e estética impecável.`;

    setCustomTopCaption(refinedTop);
    setCustomPostCaption(refinedPost);
    if (patientContext.trim()) {
      setCustomCategory(patientContext.toUpperCase());
    }
  };

  // Motor Canvas UHD para Download Direto e Perfeito
  const handleGenerateAndOpenDownload = () => {
    setIsRendering(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const w = currentFormatObj.width;
    const h = currentFormatObj.height;
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = '#040a17';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#c8a86b';
    ctx.lineWidth = Math.max(8, Math.round(w * 0.007));
    ctx.strokeRect(30, 30, w - 60, h - 60);

    const centerX = w / 2;

    ctx.fillStyle = '#f3ece0';
    ctx.font = `600 ${Math.round(w * 0.032)}px Jost, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`Dr. ${BRAND.name}`, centerX, 110);

    ctx.fillStyle = '#c8a86b';
    ctx.font = `500 ${Math.round(w * 0.024)}px Jost, sans-serif`;
    ctx.letterSpacing = '3px';
    ctx.fillText(customCategory.toUpperCase(), centerX, 155);

    ctx.strokeStyle = '#9c7f46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 60, 185);
    ctx.lineTo(centerX + 60, 185);
    ctx.stroke();

    ctx.fillStyle = '#f3ece0';
    ctx.font = `500 ${Math.round(w * 0.046)}px "Cormorant Garamond", serif`;
    ctx.fillText(`“${customTopCaption}”`, centerX, 245);

    const boxX = 60;
    const boxY = 290;
    const boxW = w - 120;
    const boxH = Math.round(h * 0.48);

    ctx.fillStyle = '#071328';
    ctx.strokeStyle = '#c8a86b';
    ctx.lineWidth = 3;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const finishRendering = () => {
      const footerY = boxY + boxH + 40;

      ctx.fillStyle = '#e6cf9d';
      ctx.font = `400 ${Math.round(w * 0.026)}px Jost, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(customValuesLine, centerX, footerY);

      ctx.fillStyle = '#f3ece0';
      ctx.font = `300 ${Math.round(w * 0.027)}px Jost, sans-serif`;
      ctx.fillText(customPostCaption, centerX, footerY + 50, boxW);

      const btnW = Math.round(w * 0.55);
      const btnH = 65;
      const btnX = (w - btnW) / 2;
      const btnY = footerY + 90;

      ctx.fillStyle = '#c8a86b';
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 32);
      ctx.fill();

      ctx.fillStyle = '#040a17';
      ctx.font = `600 ${Math.round(w * 0.03)}px Jost, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(customCta, centerX, btnY + btnH / 2);
      ctx.textBaseline = 'alphabetic';

      ctx.fillStyle = '#c8a86b';
      ctx.font = `400 ${Math.round(w * 0.022)}px Jost, sans-serif`;
      ctx.fillText(`${BRAND.name} • ${BRAND.cro}`, centerX, btnY + btnH + 45);

      const dataUrl = canvas.toDataURL('image/png');
      setRenderedImageUrl(dataUrl);
      setIsRendering(false);
      setPreviewModalOpen(true);
    };

    if (selectedImages.length > 0) {
      if (useBeforeAfter && selectedImages.length >= 2) {
        const halfH = boxH / 2;
        let img1 = new Image();
        img1.crossOrigin = 'anonymous';
        img1.src = selectedImages[0].url;
        img1.onload = () => {
          ctx.drawImage(img1, boxX, boxY, boxW, halfH);
          ctx.fillStyle = '#040a17';
          ctx.strokeStyle = '#c8a86b';
          ctx.lineWidth = 2;
          ctx.fillRect(boxX + 15, boxY + 15, 90, 34);
          ctx.strokeRect(boxX + 15, boxY + 15, 90, 34);
          ctx.fillStyle = '#e6cf9d';
          ctx.font = `600 ${Math.round(w * 0.018)}px Jost, sans-serif`;
          ctx.fillText('ANTES', boxX + 60, boxY + 36);

          let img2 = new Image();
          img2.crossOrigin = 'anonymous';
          img2.src = selectedImages[1].url;
          img2.onload = () => {
            ctx.drawImage(img2, boxX, boxY + halfH, boxW, halfH);
            ctx.fillStyle = '#040a17';
            ctx.strokeStyle = '#c8a86b';
            ctx.lineWidth = 2;
            ctx.fillRect(boxX + 15, boxY + halfH + 15, 90, 34);
            ctx.strokeRect(boxX + 15, boxY + halfH + 15, 90, 34);
            ctx.fillStyle = '#e6cf9d';
            ctx.fillText('DEPOIS', boxX + 60, boxY + halfH + 36);

            finishRendering();
          };
          img2.onerror = finishRendering;
        };
        img1.onerror = finishRendering;
      } else {
        let img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedImages[0].url;
        img.onload = () => {
          ctx.drawImage(img, boxX, boxY, boxW, boxH);
          finishRendering();
        };
        img.onerror = finishRendering;
      }
    } else {
      finishRendering();
    }
  };

  const handleDownload = () => {
    if (!renderedImageUrl) return;
    const link = document.createElement('a');
    link.download = `post-${selectedCase}-${selectedFormat}-UHD.png`;
    link.href = renderedImageUrl;
    link.click();
  };

  return (
    <div className="wrap">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo-gold.png" alt="Logo" style={{ height: '36px' }} />
          <h1>Central de Posts &middot; Odontologia</h1>
        </div>
        <span className="uhd-badge">MANUS IA &bull; UHD</span>
      </header>

      <div className="grid">
        {/* PAINEL DE CONTROLES */}
        <div className="panel">
          
          <label>
            Formato de Saída (Instagram)
            <div className="seg">
              {FORMAT_OPTIONS.map(fmt => (
                <button
                  key={fmt.id}
                  type="button"
                  aria-pressed={selectedFormat === fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                >
                  {fmt.label.split(" ")[0]} {fmt.label.split(" ")[1]}
                </button>
              ))}
            </div>
          </label>

          <label>
            Caso Clínico / Procedimento
            <select value={selectedCase} onChange={handleCaseChange}>
              {DENTAL_CASES.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          {/* IA ESPECIALIZADA COM CONTEXTO */}
          <div style={{ borderTop: '1px solid var(--gold-d)', paddingTop: '10px', display: 'grid', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--gold)' }}>
              🧠 IA Especialista em Odontologia Estética:
            </span>

            <label>
              1. Qual o perfil ou objetivo do caso?
              <input 
                type="text" 
                value={patientContext} 
                onChange={(e) => setPatientContext(e.target.value)}
                placeholder="Ex: reabilitação estética, dentes alinhados..." 
              />
            </label>

            <label>
              2. Detalhes técnicos ou diferenciais?
              <input 
                type="text" 
                value={procedureHighlights} 
                onChange={(e) => setProcedureHighlights(e.target.value)}
                placeholder="Ex: fluxo digital, mínima desgaseificação..." 
              />
            </label>

            <button 
              type="button" 
              className="btn ghost" 
              onClick={handleAIGenerateText}
              style={{ width: '100%', borderColor: 'var(--gold)', color: 'var(--gold-l)', marginTop: '4px' }}
            >
              ✨ Gerar Textos Inteligentes com Base no Contexto
            </button>
          </div>

          {/* SUBTÍTULO / CATEGORIA */}
          <div>
            <div className="nav-header" style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Subtítulo / Categoria (Superior)</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevCategory}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextCategory}>Próxima &rsaquo;</button>
              </div>
            </div>
            <input 
              type="text" 
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          </div>

          {/* TÍTULO PRINCIPAL */}
          <div>
            <div className="nav-header" style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Frase Título Principal</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevTopCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextTopCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <input 
              type="text" 
              value={customTopCaption}
              onChange={(e) => setCustomTopCaption(e.target.value)}
            />
          </div>

          {/* VALORES / QUALIDADES */}
          <div>
            <div className="nav-header" style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Valores / Qualidades (Inferior)</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevValues}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextValues}>Próxima &rsaquo;</button>
              </div>
            </div>
            <input 
              type="text" 
              value={customValuesLine}
              onChange={(e) => setCustomValuesLine(e.target.value)}
            />
          </div>

          {/* LEGENDA DESCRITIVA */}
          <div>
            <div className="nav-header" style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Texto / Legenda Descritiva</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevPostCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextPostCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <textarea 
              rows="2"
              value={customPostCaption}
              onChange={(e) => setCustomPostCaption(e.target.value)}
            />
          </div>

          <label>
            Texto do Botão (CTA)
            <input 
              type="text" 
              value={customCta}
              onChange={(e) => setCustomCta(e.target.value)}
            />
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gold-l)' }}>
            <input 
              type="checkbox" 
              id="beforeAfterCheck" 
              checked={useBeforeAfter} 
              onChange={(e) => setUseBeforeAfter(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: 'var(--gold)' }}
            />
            <label htmlFor="beforeAfterCheck" style={{ cursor: 'pointer', margin: 0 }}>
              Ativar modo "Antes e Depois" (Tamanhos simétricos perfeitos em 2 fotos)
            </label>
          </div>

          {/* UPLOAD COMPATÍVEL COM IPHONE */}
          <label>
            Fotos do Caso Clínico
            <div className="drop" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
              {selectedImages.length > 0 ? (
                <span>{selectedImages.length} foto(s) anexada(s). Toque para adicionar mais.</span>
              ) : (
                <span>Toque aqui para selecionar as fotos do iPhone (Fototeca ou Câmera)</span>
              )}
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="image/*,image/heic,image/heif" 
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>

          {selectedImages.length > 0 && (
            <div className="row">
              {selectedImages.map((img, index) => (
                <div key={index} style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--gold-d)' }}>
                  <img src={img.url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '1px', right: '1px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '15px', height: '15px', fontSize: '9px', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* BOTÃO DE GERAR E BAIXAR */}
          <button className="btn" onClick={handleGenerateAndOpenDownload} disabled={isRendering}>
            {isRendering ? 'Processando Imagem UHD...' : '⚡ Gerar & Baixar Imagem UHD'}
          </button>

        </div>

        {/* PREVIEW EM TEMPO REAL */}
        <div className="stage">
          <div className="preview-card" style={{ width: '100%', maxWidth: '440px' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--gold-l)', textTransform: 'uppercase' }}>
                Preview Fiel do Layout (UHD)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gold)' }}>
                {currentFormatObj.label.split(" ")[0]}
              </span>
            </div>

            <div 
              style={{ 
                width: '100%',
                aspectRatio: currentFormatObj.ratio,
                border: '2px solid var(--gold)', 
                borderRadius: '16px',
                padding: '24px 20px',
                background: '#040a17',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 25px 50px rgba(0,0,0,0.9)',
                position: 'relative'
              }}
            >
              
              {/* TOPO: LOGO + NOME + CATEGORIA + TÍTULO */}
              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/logo-gold.png" alt="Logo" style={{ height: '24px', width: 'auto' }} />
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#f3ece0' }}>Dr. {BRAND.name}</span>
                </div>

                <span style={{ fontSize: '10px', color: '#c8a86b', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: '2px' }}>
                  {customCategory}
                </span>

                <div style={{ width: '50px', height: '1px', background: '#9c7f46', margin: '6px 0' }} />

                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: '#f3ece0', fontWeight: '500', lineHeight: '1.25', margin: '4px 0' }}>
                  &ldquo;{customTopCaption}&rdquo;
                </h2>
              </div>

              {/* MOLDURA CENTRAL COM TAMANHOS DE FOTO IDÊNTICOS */}
              <div 
                style={{ 
                  width: '100%', 
                  flex: 1, 
                  margin: '16px 0', 
                  border: '1px solid #c8a86b', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  background: '#071328', 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {selectedImages.length > 0 ? (
                  useBeforeAfter && selectedImages.length >= 2 ? (
                    <>
                      <div style={{ height: '50%', width: '100%', position: 'relative', borderBottom: '1px solid #c8a86b', overflow: 'hidden' }}>
                        <img src={selectedImages[0].url} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#040a17', border: '1px solid #c8a86b', color: '#e6cf9d', fontSize: '9px', padding: '3px 9px', fontWeight: 'bold', borderRadius: '3px' }}>ANTES</span>
                      </div>
                      <div style={{ height: '50%', width: '100%', position: 'relative', overflow: 'hidden' }}>
                        <img src={selectedImages[1].url} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#040a17', border: '1px solid #c8a86b', color: '#e6cf9d', fontSize: '9px', padding: '3px 9px', fontWeight: 'bold', borderRadius: '3px' }}>DEPOIS</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                      <img src={selectedImages[0].url} alt="Caso" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )
                ) : (
                  <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#9c7f46', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                    Anexe as fotos para visualizar o enquadramento simétrico
                  </div>
                )}
              </div>

              {/* RODAPÉ */}
              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '11px', color: '#e6cf9d', letterSpacing: '1.5px' }}>
                  {customValuesLine}
                </p>

                <p style={{ fontSize: '11px', color: '#f3ece0', opacity: 0.9, lineHeight: '1.3' }}>
                  {customPostCaption}
                </p>

                <div 
                  style={{ 
                    background: 'linear-gradient(135deg, #e6cf9d, #c8a86b 55%, #9c7f46)', 
                    color: '#040a17', 
                    padding: '10px 28px', 
                    borderRadius: '999px', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(200, 168, 107, 0.4)',
                    marginTop: '4px'
                  }}
                >
                  {customCta}
                </div>

                <p style={{ fontSize: '10px', color: '#c8a86b', opacity: 0.8, marginTop: '2px' }}>
                  {BRAND.name} &bull; {BRAND.cro}
                </p>
              </div>

            </div>

            <button className="btn" onClick={handleGenerateAndOpenDownload} style={{ width: '100%', marginTop: '6px' }}>
              ⚡ Gerar & Baixar Imagem UHD
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE DOWNLOAD */}
      {previewModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(4, 10, 23, 0.95)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--navy)', border: '1px solid var(--gold)', borderRadius: '16px',
            maxWidth: '460px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '18px',
            display: 'grid', gap: '14px', justifyItems: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--gold-l)' }}>
                Arte Pronta em Alta Definição (UHD)
              </h3>
              <button onClick={() => setPreviewModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--gold)', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {renderedImageUrl && (
              <img src={renderedImageUrl} alt="Render UHD" style={{ width: '100%', height: 'auto', borderRadius: '10px', border: '1px solid var(--gold-d)' }} />
            )}

            <div style={{ width: '100%', display: 'grid', gap: '8px' }}>
              <button className="btn" onClick={handleDownload} style={{ width: '100%' }}>
                ⬇️ Baixar Imagem Pronta (.PNG)
              </button>
              <button className="btn ghost" onClick={() => setPreviewModalOpen(false)} style={{ width: '100%', padding: '8px' }}>
                Voltar e Ajustar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}