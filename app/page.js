'use client';

import { useState, useRef } from 'react';
import { BRAND, DENTAL_CASES, FORMAT_OPTIONS } from '../lib/brand';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState(DENTAL_CASES[0].id);
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[0].id);
  const [selectedImages, setSelectedImages] = useState([]);
  
  // Opção de Antes e Depois (Ativada por padrão)
  const [useBeforeAfter, setUseBeforeAfter] = useState(true);

  // Navegação de títulos e legendas
  const [topCaptionIndex, setTopCaptionIndex] = useState(0);
  const [postCaptionIndex, setPostCaptionIndex] = useState(0);

  // Campos manuais para personalização ou IA automática
  const [customTopCaption, setCustomTopCaption] = useState('');
  const [customPostCaption, setCustomPostCaption] = useState('');
  const [customCta, setCustomCta] = useState('');

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
    setCustomTopCaption('');
    setCustomPostCaption('');
    setCustomCta('');
  };

  const prevTopCaption = () => {
    setTopCaptionIndex(prev => (prev === 0 ? currentCaseObj.topCaptions.length - 1 : prev - 1));
    setCustomTopCaption('');
  };
  const nextTopCaption = () => {
    setTopCaptionIndex(prev => (prev === currentCaseObj.topCaptions.length - 1 ? 0 : prev + 1));
    setCustomTopCaption('');
  };

  const prevPostCaption = () => {
    setPostCaptionIndex(prev => (prev === 0 ? currentCaseObj.postCaptions.length - 1 : prev - 1));
    setCustomPostCaption('');
  };
  const nextPostCaption = () => {
    setPostCaptionIndex(prev => (prev === currentCaseObj.postCaptions.length - 1 ? 0 : prev + 1));
    setCustomPostCaption('');
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

  // Textos finais ativos (prioriza o que o usuário digitar manualmente, senão usa o catálogo)
  const activeTopCaption = customTopCaption.trim() || currentCaseObj.topCaptions[topCaptionIndex];
  const activePostCaption = customPostCaption.trim() || currentCaseObj.postCaptions[postCaptionIndex];
  const activeCta = customCta.trim() || currentCaseObj.ctaButtons[0] || "Agende sua avaliação";

  // Botão gerador automático por IA (Simula refinamento inteligente instantâneo)
  const handleAIGenerateText = () => {
    const aiVariationsTop = [
      `Transformação surpreendente em ${currentCaseObj.label.toLowerCase()}.`,
      `Recupere sua harmonia estética com segurança e precisão.`,
      `Cada sorriso é uma obra de arte planejada para você.`
    ];
    const aiVariationsPost = [
      `Procedimento realizado com tecnologia de ponta, preservando a naturalidade e garantindo durabilidade.`,
      `Estética e função caminhando juntas para transformar o seu sorriso e sua autoestima.`
    ];
    const randomTop = aiVariationsTop[Math.floor(Math.random() * aiVariationsTop.length)];
    const randomPost = aiVariationsPost[Math.floor(Math.random() * aiVariationsPost.length)];
    
    setCustomTopCaption(randomTop);
    setCustomPostCaption(randomPost);
  };

  // Renderizador UHD idêntico aos exemplos enviados
  const renderCanvasPost = () => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject('Canvas não disponível');

      const ctx = canvas.getContext('2d');
      const w = currentFormatObj.width;
      const h = currentFormatObj.height;

      canvas.width = w;
      canvas.height = h;

      // 1. Fundo Deep Navy exato
      ctx.fillStyle = '#040a17';
      ctx.fillRect(0, 0, w, h);

      // 2. Moldura Dourada Externa
      ctx.strokeStyle = '#c8a86b';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      const topHeaderH = Math.round(h * 0.17);
      const footerH = Math.round(h * 0.20);
      const contentH = h - topHeaderH - footerH;

      // 3. Logo Gráfico Centralizado (Simulado em vetor dourado nítido)
      const logoY = 65;
      ctx.strokeStyle = '#c8a86b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w / 2 - 120, logoY, 14, Math.PI, 0, false);
      ctx.stroke();

      // Nome do Doutor no Topo
      ctx.fillStyle = '#f3ece0';
      ctx.font = `600 ${Math.round(w * 0.032)}px Jost, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`Dr. ${BRAND.name}`, w / 2, logoY + 6);

      // Linhas decorativas do topo
      ctx.strokeStyle = '#9c7f46';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 220, logoY + 25);
      ctx.lineTo(w / 2 - 140, logoY + 25);
      ctx.moveTo(w / 2 + 140, logoY + 25);
      ctx.lineTo(w / 2 + 220, logoY + 25);
      ctx.stroke();

      // 4. Categoria do Caso (ex: RESINAS COMPOSTAS)
      ctx.fillStyle = '#c8a86b';
      ctx.font = `500 ${Math.round(w * 0.022)}px Jost, sans-serif`;
      ctx.letterSpacing = '3px';
      ctx.fillText(currentCaseObj.categoryTitle, w / 2, 125);

      // 5. Título Principal (Cormorant Garamond)
      ctx.fillStyle = '#f3ece0';
      ctx.font = `600 ${Math.round(w * 0.046)}px "Cormorant Garamond", serif`;
      ctx.fillText(`“${activeTopCaption}”`, w / 2, 175);

      // Linha sutil separadora
      ctx.strokeStyle = '#9c7f46';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, 205);
      ctx.lineTo(w * 0.7, 205);
      ctx.stroke();

      // 6. Área das Fotos (Com Moldura Exata dos Exemplos)
      const drawImages = () => {
        const imgAreaY = topHeaderH + 20;
        const imgAreaH = contentH - 30;
        const imgAreaW = w - 100;
        const imgAreaX = 50;

        // Fundo da caixa de fotos
        ctx.fillStyle = '#071328';
        ctx.strokeStyle = '#c8a86b';
        ctx.lineWidth = 3;
        ctx.strokeRect(imgAreaX, imgAreaY, imgAreaW, imgAreaH);

        if (selectedImages.length === 0) {
          ctx.fillStyle = '#c8a86b';
          ctx.font = `300 ${Math.round(w * 0.03)}px Jost, sans-serif`;
          ctx.fillText('Nenhuma foto anexada', w / 2, imgAreaY + imgAreaH / 2);
          drawFooter();
          return;
        }

        if (useBeforeAfter && selectedImages.length >= 2) {
          const halfH = (imgAreaH - 12) / 2;

          let img1 = new Image();
          img1.crossOrigin = 'anonymous';
          img1.src = selectedImages[0].url;

          img1.onload = () => {
            // Imagem 1 (Antes)
            ctx.drawImage(img1, imgAreaX + 3, imgAreaY + 3, imgAreaW - 6, halfH - 3);
            drawBadge("ANTES", imgAreaX + 24, imgAreaY + 20);

            let img2 = new Image();
            img2.crossOrigin = 'anonymous';
            img2.src = selectedImages[1].url;

            img2.onload = () => {
              // Imagem 2 (Depois)
              const secondY = imgAreaY + halfH + 6;
              ctx.drawImage(img2, imgAreaX + 3, secondY, imgAreaW - 6, halfH - 3);
              drawBadge("DEPOIS", imgAreaX + 24, secondY + 20);

              drawFooter();
            };
            img2.onerror = () => drawFooter();
          };
          img1.onerror = () => drawFooter();
        } else {
          let img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = selectedImages[0].url;

          img.onload = () => {
            ctx.drawImage(img, imgAreaX + 3, imgAreaY + 3, imgAreaW - 6, imgAreaH - 6);
            drawFooter();
          };
          img.onerror = () => drawFooter();
        }
      };

      const drawBadge = (text, x, y) => {
        ctx.fillStyle = '#071328';
        ctx.strokeStyle = '#c8a86b';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, 120, 38);
        ctx.strokeRect(x, y, 120, 38);

        ctx.fillStyle = '#e6cf9d';
        ctx.font = `600 ${Math.round(w * 0.022)}px Jost, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + 60, y + 19);
        ctx.textBaseline = 'alphabetic';
      };

      // 7. Rodapé com Descrição e Botão CTA
      const drawFooter = () => {
        const footerY = h - footerH;

        // Texto descritivo centralizado
        ctx.fillStyle = '#f3ece0';
        ctx.font = `300 ${Math.round(w * 0.027)}px Jost, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(activePostCaption, w / 2, footerY + 35);

        // Botão Dourado de CTA (Agende sua avaliação)
        const btnW = Math.round(w * 0.6);
        const btnH = 64;
        const btnX = (w - btnW) / 2;
        const btnY = footerY + 60;

        ctx.fillStyle = '#c8a86b';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 32);
        ctx.fill();

        ctx.fillStyle = '#040a17';
        ctx.font = `600 ${Math.round(w * 0.03)}px Jost, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activeCta, w / 2, btnY + btnH / 2);

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
      alert('Erro ao gerar pré-visualização: ' + err);
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

          {/* BOTÃO DE GERAÇÃO INTELIGENTE POR IA */}
          <button 
            type="button" 
            className="btn ghost" 
            onClick={handleAIGenerateText}
            style={{ width: '100%', borderColor: 'var(--gold)', color: 'var(--gold-l)', padding: '10px' }}
          >
            ✨ Gerar Textos Automaticamente com IA
          </button>

          {/* TÍTULO PRINCIPAL COM BOTÕES DE NAVEGAÇÃO E EDIÇÃO */}
          <div>
            <div className="nav-header" style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Frase Título (Foto)</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevTopCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextTopCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <input 
              type="text" 
              value={activeTopCaption}
              onChange={(e) => setCustomTopCaption(e.target.value)}
              placeholder="Digite ou escolha nas setas acima..."
            />
          </div>

          {/* LEGENDA COM BOTÕES DE NAVEGAÇÃO E EDIÇÃO */}
          <div>
            <div className="nav-header" style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Legenda / Descrição</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevPostCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextPostCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <textarea 
              rows="2"
              value={activePostCaption}
              onChange={(e) => setCustomPostCaption(e.target.value)}
              placeholder="Digite ou escolha nas setas acima..."
            />
          </div>

          {/* BOTÃO CTA */}
          <label>
            Texto do Botão (CTA)
            <input 
              type="text" 
              value={activeCta}
              onChange={(e) => setCustomCta(e.target.value)}
              placeholder="Ex: Agende sua avaliação"
            />
          </label>

          {/* OPÇÃO ANTES E DEPOIS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--gold-l)' }}>
            <input 
              type="checkbox" 
              id="beforeAfterCheck" 
              checked={useBeforeAfter} 
              onChange={(e) => setUseBeforeAfter(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: 'var(--gold)' }}
            />
            <label htmlFor="beforeAfterCheck" style={{ cursor: 'pointer', margin: 0 }}>
              Exibir duas fotos empilhadas com selos "Antes e Depois"
            </label>
          </div>

          {/* UPLOAD DE FOTOS */}
          <label>
            Fotos do Caso (Envie 2 para Antes / Depois)
            <div className="drop" onClick={() => document.getElementById('fileInput').click()}>
              {selectedImages.length > 0 ? (
                <span>{selectedImages.length} foto(s) anexada(s). Clique para adicionar mais.</span>
              ) : (
                <span>Clique aqui para carregar as fotos</span>
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

          <button className="btn" onClick={handleOpenPreview} disabled={isRendering}>
            {isRendering ? 'Renderizando em UHD...' : '👁️ Pré-visualizar Imagem Final'}
          </button>

        </div>

        {/* PREVIEW MOBILE */}
        <div className="stage">
          <div className="preview-card">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--gold-l)', textTransform: 'uppercase' }}>
                Preview Exato do Layout
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gold)' }}>
                {currentFormatObj.label.split(" ")[0]}
              </span>
            </div>

            <div className="preview-container" style={{ aspectRatio: currentFormatObj.ratio }}>
              <div style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid var(--gold-d)', background: 'var(--navy)' }}>
                <p style={{ fontSize: '10px', color: 'var(--cream)', fontWeight: '500' }}>Dr. {BRAND.name}</p>
                <span style={{ fontSize: '8px', color: 'var(--gold)', letterSpacing: '1px' }}>{currentCaseObj.categoryTitle}</span>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '13px', color: 'var(--gold-l)', fontWeight: '600', marginTop: '2px' }}>
                  &ldquo;{activeTopCaption}&rdquo;
                </p>
              </div>

              <div style={{ flex: 1, position: 'relative', background: '#071328', display: 'flex', flexDirection: 'column', padding: '6px', gap: '6px' }}>
                {selectedImages.length > 0 ? (
                  useBeforeAfter && selectedImages.length >= 2 ? (
                    <>
                      <div style={{ flex: 1, position: 'relative', border: '1px solid var(--gold)', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={selectedImages[0].url} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--deep)', border: '1px solid var(--gold)', color: 'var(--gold-l)', fontSize: '7px', padding: '2px 6px', fontWeight: 'bold' }}>ANTES</span>
                      </div>
                      <div style={{ flex: 1, position: 'relative', border: '1px solid var(--gold)', borderRadius: '4px', overflow: 'hidden' }}>
                        <img src={selectedImages[1].url} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--deep)', border: '1px solid var(--gold)', color: 'var(--gold-l)', fontSize: '7px', padding: '2px 6px', fontWeight: 'bold' }}>DEPOIS</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, position: 'relative', border: '1px solid var(--gold)', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={selectedImages[0].url} alt="Caso" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )
                ) : (
                  <div style={{ flex: '1', display: 'grid', placeItems: 'center', color: 'var(--gold-d)', fontSize: '11px', textAlign: 'center', padding: '10px' }}>
                    Envie 2 fotos para visualizar o Antes e Depois
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 12px', background: 'var(--navy)', borderTop: '1px solid var(--gold-d)', textAlign: 'center', display: 'grid', gap: '6px' }}>
                <p style={{ fontSize: '9px', color: 'var(--cream)', lineHeight: '1.2' }}>
                  {activePostCaption}
                </p>
                <div style={{ background: 'var(--gold)', color: 'var(--deep)', padding: '5px', borderRadius: '12px', fontSize: '9px', fontWeight: '600' }}>
                  {activeCta}
                </div>
              </div>
            </div>

            <button className="btn" onClick={handleOpenPreview} style={{ width: '100%', marginTop: '4px' }}>
              🔍 Pré-visualizar & Baixar Imagem UHD
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO */}
      {previewModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(4, 10, 23, 0.95)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--navy)', border: '1px solid var(--gold)', borderRadius: '16px',
            maxWidth: '460px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '16px',
            display: 'grid', gap: '12px', justifyItems: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--gold-l)' }}>
                Arte Final em Alta Definição (UHD)
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
              <button className="btn ghost" onClick={() => setPreviewModalOpen(false)} style={{ width: '100%', padding: '8px' }}>
                Voltar e Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}