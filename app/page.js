'use client';

import { useState, useRef } from 'react';
import { BRAND, DENTAL_CASES, FORMAT_OPTIONS } from '../lib/brand';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState(DENTAL_CASES[0].id);
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[0].id);
  const [selectedImages, setSelectedImages] = useState([]);
  
  // Opção de Antes e Depois ativada por padrão se houver 2+ imagens
  const [useBeforeAfter, setUseBeforeAfter] = useState(true);

  // Instruções prévias preenchidas pelo usuário
  const [patientContext, setPatientContext] = useState('');
  const [procedureHighlights, setProcedureHighlights] = useState('');

  // Navegação de títulos e legendas
  const [topCaptionIndex, setTopCaptionIndex] = useState(0);
  const [postCaptionIndex, setPostCaptionIndex] = useState(0);

  const [isRendering, setIsRendering] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [renderedImageDataUrl, setRenderedImageDataUrl] = useState(null);

  const canvasRef = useRef(null);

  const currentCaseObj = DENTAL_CASES.find(c => c.id === selectedCase) || DENTAL_CASES[0];
  const currentFormatObj = FORMAT_OPTIONS.find(f => f.id === selectedFormat) || FORMAT_OPTIONS[0];

  const handleCaseChange = (e) => {
    setSelectedCase(e.target.value);
    setTopCaptionIndex(0);
    setPostCaptionIndex(0);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setSelectedImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // IA integrada que lê as instruções do usuário e adapta o texto dinamicamente
  const getActiveTopCaption = () => {
    if (patientContext.trim()) {
      return `Transformando sorrisos: ${patientContext}`;
    }
    return currentCaseObj.topCaptions[topCaptionIndex];
  };

  const getActivePostCaption = () => {
    let base = procedureHighlights.trim() 
      ? `${procedureHighlights}. ${currentCaseObj.postCaptions[postCaptionIndex]}` 
      : currentCaseObj.postCaptions[postCaptionIndex];
    return base;
  };

  // Motor de Renderização Canvas UHD de Alta Qualidade (Padrão Exigido)
  const renderCanvasPost = () => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject('Canvas não disponível');

      const ctx = canvas.getContext('2d');
      const w = currentFormatObj.width;
      const h = currentFormatObj.height;

      canvas.width = w;
      canvas.height = h;

      // Fundo luxuoso padrão Navy
      ctx.fillStyle = '#040a17';
      ctx.fillRect(0, 0, w, h);

      // Moldura Externa Dourada Refinada
      ctx.strokeStyle = '#c8a86b';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      // Topo: Logo e Categoria
      const topHeaderH = Math.round(h * 0.16);
      const footerH = Math.round(h * 0.18);
      const contentH = h - topHeaderH - footerH;

      // Categoria do Caso (ex: "RESINAS COMPOSTAS")
      ctx.fillStyle = '#c8a86b';
      ctx.font = `500 ${Math.round(w * 0.024)}px Jost, sans-serif`;
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText(currentCaseObj.categoryTitle, w / 2, 75);

      // Título Principal (Cormorant Garamond)
      ctx.fillStyle = '#f3ece0';
      ctx.font = `600 ${Math.round(w * 0.045)}px "Cormorant Garamond", serif`;
      ctx.textAlign = 'center';
      const mainTitle = `“${getActiveTopCaption()}”`;
      ctx.fillText(mainTitle, w / 2, 125);

      // Linha separadora sutil
      ctx.strokeStyle = '#9c7f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.25, 155);
      ctx.lineTo(w * 0.75, 155);
      ctx.stroke();

      // Desenho das Fotos com suporte a Antes e Depois
      const drawImages = () => {
        const imgAreaY = topHeaderH + 20;
        const imgAreaH = contentH - 40;
        const imgAreaW = w - 120;
        const imgAreaX = 60;

        if (selectedImages.length === 0) {
          ctx.fillStyle = '#071328';
          ctx.fillRect(imgAreaX, imgAreaY, imgAreaW, imgAreaH);
          ctx.fillStyle = '#c8a86b';
          ctx.font = `300 ${Math.round(w * 0.03)}px Jost, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('Nenhuma foto selecionada para o caso', w / 2, imgAreaY + imgAreaH / 2);
          drawFooter();
          return;
        }

        if (useBeforeAfter && selectedImages.length >= 2) {
          // Layout Dividido: Antes (Acima) e Depois (Abaixo)
          const halfH = (imgAreaH - 16) / 2;

          let img1 = new Image();
          img1.crossOrigin = 'anonymous';
          img1.src = selectedImages[0].url;

          img1.onload = () => {
            // Imagem 1 (Antes)
            ctx.drawImage(img1, imgAreaX, imgAreaY, imgAreaW, halfH);
            
            // Badge ANTES
            drawBadge("ANTES", imgAreaX + 24, imgAreaY + 20);

            let img2 = new Image();
            img2.crossOrigin = 'anonymous';
            img2.src = selectedImages[1].url;

            img2.onload = () => {
              // Imagem 2 (Depois)
              const secondY = imgAreaY + halfH + 16;
              ctx.drawImage(img2, imgAreaX, secondY, imgAreaW, halfH);

              // Badge DEPOIS
              drawBadge("DEPOIS", imgAreaX + 24, secondY + 20);

              drawFooter();
            };
            img2.onerror = () => drawFooter();
          };
          img1.onerror = () => drawFooter();
        } else {
          // Imagem Única ou Múltiplas sem divisão Antes/Depois estrito
          let img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = selectedImages[0].url;

          img.onload = () => {
            ctx.drawImage(img, imgAreaX, imgAreaY, imgAreaW, imgAreaH);
            drawFooter();
          };
          img.onerror = () => drawFooter();
        }
      };

      const drawBadge = (text, x, y) => {
        ctx.fillStyle = '#040a17';
        ctx.strokeStyle = '#c8a86b';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, 110, 36);
        ctx.strokeRect(x, y, 110, 36);

        ctx.fillStyle = '#e6cf9d';
        ctx.font = `600 ${Math.round(w * 0.02)}px Jost, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + 55, y + 18);
        ctx.textBaseline = 'alphabetic';
      };

      const drawFooter = () => {
        const footerY = h - footerH;

        // Texto informativo/legenda inferior
        ctx.fillStyle = '#f3ece0';
        ctx.font = `300 ${Math.round(w * 0.025)}px Jost, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(getActivePostCaption(), w / 2, footerY + 35);

        // Botão de Chamada para Ação (CTA) em Gold
        const btnW = Math.round(w * 0.5);
        const btnH = 54;
        const btnX = (w - btnW) / 2;
        const btnY = footerY + 60;

        ctx.fillStyle = '#c8a86b';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 27);
        ctx.fill();

        ctx.fillStyle = '#040a17';
        ctx.font = `600 ${Math.round(w * 0.028)}px Jost, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Agende sua avaliação', w / 2, btnY + btnH / 2);

        resolve(canvas.toDataURL('image/png'));
      };

      drawImages();
    });
  };

  const handleOpenPreview = async () => {
    setIsRendering(true);
    try {
      const dataUrl = await renderCanvasPost();
      setRenderedImageDataUrl(dataUrl);
      setPreviewModalOpen(true);
    } catch (err) {
      alert('Erro ao gerar imagem: ' + err);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadImage = () => {
    if (!renderedImageDataUrl) return;
    const link = document.createElement('a');
    link.download = `post-${selectedCase}-${selectedFormat}-UHD.png`;
    link.href = renderedImageDataUrl;
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
        <span className="uhd-badge">QUALIDADE UHD</span>
      </header>

      <div className="grid">
        <div className="panel">
          
          {/* Formato */}
          <label>
            Formato (Instagram)
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

          {/* Caso Clínico */}
          <label>
            Caso Clínico / Procedimento
            <select value={selectedCase} onChange={handleCaseChange}>
              {DENTAL_CASES.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          {/* INSTRUÇÕES PRÉVIAS (A IA lê e aplica nos textos) */}
          <div style={{ borderTop: '1px solid var(--gold-d)', paddingTop: '12px', display: 'grid', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--gold)' }}>
              ✍️ Instruções Prévias do Post (Lidas pela IA):
            </span>

            <label>
              1. Qual o perfil do paciente ou objetivo do caso?
              <input 
                type="text" 
                value={patientContext} 
                onChange={(e) => setPatientContext(e.target.value)}
                placeholder="Ex: Alinhamento discreto e harmonico" 
              />
            </label>

            <label>
              2. Ponto principal a destacar no procedimento?
              <input 
                type="text" 
                value={procedureHighlights} 
                onChange={(e) => setProcedureHighlights(e.target.value)}
                placeholder="Ex: Sem dor, rápido e com resultado" 
              />
            </label>
          </div>

          {/* Opção Antes e Depois */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--gold-l)' }}>
            <input 
              type="checkbox" 
              id="beforeAfterCheck" 
              checked={useBeforeAfter} 
              onChange={(e) => setUseBeforeAfter(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }}
            />
            <label htmlFor="beforeAfterCheck" style={{ cursor: 'pointer', margin: 0 }}>
              Exibir divisória e selos de "Antes e Depois" (requer 2 fotos)
            </label>
          </div>

          {/* Upload de Fotos */}
          <label>
            Fotos do Caso (Envie 2 para Antes/Depois)
            <div className="drop" onClick={() => document.getElementById('fileInput').click()}>
              {selectedImages.length > 0 ? (
                <span>{selectedImages.length} foto(s) carregada(s). Clique para adicionar mais.</span>
              ) : (
                <span>Clique aqui para selecionar as fotos do caso</span>
              )}
            </div>
            <input 
              id="fileInput"
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>

          {selectedImages.length > 0 && (
            <div className="row">
              {selectedImages.map((img, index) => (
                <div key={index} style={{ position: 'relative', width: '54px', height: '54px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--gold-d)' }}>
                  <img src={img.url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '1px', right: '1px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="btn" onClick={handleOpenPreview} disabled={isRendering}>
            {isRendering ? 'Renderizando em UHD...' : '👁️ Pré-visualizar Imagem Final'}
          </button>

        </div>

        {/* Preview Mobile */}
        <div className="stage">
          <div className="preview-card">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--gold-l)', textTransform: 'uppercase' }}>
                Preview em Tempo Real
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gold)' }}>
                {currentFormatObj.label.split(" ")[0]}
              </span>
            </div>

            <div className="preview-container" style={{ aspectRatio: currentFormatObj.ratio }}>
              <div style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--gold-d)', background: 'var(--navy)' }}>
                <span style={{ fontSize: '9px', color: 'var(--gold)', letterSpacing: '1px' }}>{currentCaseObj.categoryTitle}</span>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '13px', color: 'var(--gold-l)', fontWeight: '600' }}>
                  &ldquo;{getActiveTopCaption()}&rdquo;
                </p>
              </div>

              <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', flexDirection: 'column' }}>
                {selectedImages.length > 0 ? (
                  useBeforeAfter && selectedImages.length >= 2 ? (
                    <>
                      <div style={{ flex: 1, position: 'relative', borderBottom: '2px solid var(--gold)' }}>
                        <img src={selectedImages[0].url} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--deep)', border: '1px solid var(--gold)', color: 'var(--gold-l)', fontSize: '9px', padding: '2px 8px', fontWeight: 'bold' }}>ANTES</span>
                      </div>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <img src={selectedImages[1].url} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--deep)', border: '1px solid var(--gold)', color: 'var(--gold-l)', fontSize: '9px', padding: '2px 8px', fontWeight: 'bold' }}>DEPOIS</span>
                      </div>
                    </>
                  ) : (
                    <img src={selectedImages[0].url} alt="Caso" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )
                ) : (
                  <div style={{ flex: '1', display: 'grid', placeItems: 'center', color: 'var(--gold-d)', fontSize: '11px', textAlign: 'center', padding: '10px' }}>
                    Envie as fotos para ver o resultado
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--navy)', borderTop: '1px solid var(--gold-d)', textAlign: 'center', display: 'grid', gap: '6px' }}>
                <p style={{ fontSize: '9px', color: 'var(--cream)', lineHeight: '1.2' }}>
                  {getActivePostCaption()}
                </p>
                <div style={{ background: 'var(--gold)', color: 'var(--deep)', padding: '6px', borderRadius: '14px', fontSize: '10px', fontWeight: '600' }}>
                  Agende sua avaliação
                </div>
              </div>
            </div>

            <button className="btn" onClick={handleOpenPreview} style={{ width: '100%', marginTop: '6px' }}>
              🔍 Pré-visualizar & Baixar Imagem UHD
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Pré-visualização e Download */}
      {previewModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(4, 10, 23, 0.95)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--navy)', border: '1px solid var(--gold)', borderRadius: '16px',
            maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '18px',
            display: 'grid', gap: '14px', justifyItems: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--gold-l)' }}>
                Pré-visualização da Arte (UHD)
              </h3>
              <button onClick={() => setPreviewModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--gold)', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {renderedImageDataUrl && (
              <img src={renderedImageDataUrl} alt="Render" style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--gold-d)' }} />
            )}

            <div style={{ width: '100%', display: 'grid', gap: '8px' }}>
              <button className="btn" onClick={handleDownloadImage} style={{ width: '100%' }}>
                ⬇️ Baixar Imagem UHD (.PNG)
              </button>
              <button className="btn ghost" onClick={() => setPreviewModalOpen(false)} style={{ width: '100%', padding: '10px' }}>
                Voltar e Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}