'use client';

import { useState, useRef } from 'react';
import { BRAND, DENTAL_CASES, FORMAT_OPTIONS } from '../lib/brand';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState(DENTAL_CASES[0].id);
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[0].id);
  const [selectedImages, setSelectedImages] = useState([]);
  
  // Opção Antes e Depois
  const [useBeforeAfter, setUseBeforeAfter] = useState(true);

  // Instruções prévias do usuário
  const [patientContext, setPatientContext] = useState('');
  const [procedureHighlights, setProcedureHighlights] = useState('');

  // Navegação dos índices das frases e legendas
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

  const prevTopCaption = () => {
    setTopCaptionIndex(prev => (prev === 0 ? currentCaseObj.topCaptions.length - 1 : prev - 1));
  };
  const nextTopCaption = () => {
    setTopCaptionIndex(prev => (prev === currentCaseObj.topCaptions.length - 1 ? 0 : prev + 1));
  };

  const prevPostCaption = () => {
    setPostCaptionIndex(prev => (prev === 0 ? currentCaseObj.postCaptions.length - 1 : prev - 1));
  };
  const nextPostCaption = () => {
    setPostCaptionIndex(prev => (prev === currentCaseObj.postCaptions.length - 1 ? 0 : prev + 1));
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

  // Lógica inteligente que mescla as instruções digitadas com a frase do catálogo selecionada
  const getDisplayTopCaption = () => {
    const basePhrase = currentCaseObj.topCaptions[topCaptionIndex];
    if (patientContext.trim()) {
      return `${basePhrase} — ${patientContext.trim()}`;
    }
    return basePhrase;
  };

  const getDisplayPostCaption = () => {
    const baseCaption = currentCaseObj.postCaptions[postCaptionIndex];
    if (procedureHighlights.trim()) {
      return `${baseCaption} Destaque do procedimento: ${procedureHighlights.trim()}.`;
    }
    return baseCaption;
  };

  // Motor de Renderização Canvas UHD
  const renderCanvasPost = () => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject('Canvas não disponível');

      const ctx = canvas.getContext('2d');
      const w = currentFormatObj.width;
      const h = currentFormatObj.height;

      canvas.width = w;
      canvas.height = h;

      // Fundo Deep
      ctx.fillStyle = '#040a17';
      ctx.fillRect(0, 0, w, h);

      // Moldura Dourada
      ctx.strokeStyle = '#c8a86b';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      const topHeaderH = Math.round(h * 0.17);
      const footerH = Math.round(h * 0.18);
      const contentH = h - topHeaderH - footerH;

      // Categoria do Caso
      ctx.fillStyle = '#c8a86b';
      ctx.font = `500 ${Math.round(w * 0.024)}px Jost, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(currentCaseObj.categoryTitle, w / 2, 75);

      // Título Principal Combinado
      ctx.fillStyle = '#f3ece0';
      ctx.font = `600 ${Math.round(w * 0.04)}px "Cormorant Garamond", serif`;
      ctx.textAlign = 'center';
      const mainTitle = `“${getDisplayTopCaption()}”`;
      ctx.fillText(mainTitle, w / 2, 125);

      // Linha Divisória Superior
      ctx.strokeStyle = '#9c7f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.25, 155);
      ctx.lineTo(w * 0.75, 155);
      ctx.stroke();

      const drawImages = () => {
        const imgAreaY = topHeaderH + 15;
        const imgAreaH = contentH - 30;
        const imgAreaW = w - 120;
        const imgAreaX = 60;

        if (selectedImages.length === 0) {
          ctx.fillStyle = '#071328';
          ctx.fillRect(imgAreaX, imgAreaY, imgAreaW, imgAreaH);
          ctx.fillStyle = '#c8a86b';
          ctx.font = `300 ${Math.round(w * 0.03)}px Jost, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('Nenhuma foto anexada ao caso', w / 2, imgAreaY + imgAreaH / 2);
          drawFooter();
          return;
        }

        if (useBeforeAfter && selectedImages.length >= 2) {
          const halfH = (imgAreaH - 16) / 2;

          let img1 = new Image();
          img1.crossOrigin = 'anonymous';
          img1.src = selectedImages[0].url;

          img1.onload = () => {
            ctx.drawImage(img1, imgAreaX, imgAreaY, imgAreaW, halfH);
            drawBadge("ANTES", imgAreaX + 20, imgAreaY + 16);

            let img2 = new Image();
            img2.crossOrigin = 'anonymous';
            img2.src = selectedImages[1].url;

            img2.onload = () => {
              const secondY = imgAreaY + halfH + 16;
              ctx.drawImage(img2, imgAreaX, secondY, imgAreaW, halfH);
              drawBadge("DEPOIS", imgAreaX + 20, secondY + 16);
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
        ctx.fillRect(x, y, 100, 34);
        ctx.strokeRect(x, y, 100, 34);

        ctx.fillStyle = '#e6cf9d';
        ctx.font = `600 ${Math.round(w * 0.02)}px Jost, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + 50, y + 17);
        ctx.textBaseline = 'alphabetic';
      };

      const drawFooter = () => {
        const footerY = h - footerH;

        // Legenda Inferior Combinada
        ctx.fillStyle = '#f3ece0';
        ctx.font = `300 ${Math.round(w * 0.023)}px Jost, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(getDisplayPostCaption().slice(0, 110) + '...', w / 2, footerY + 30);

        // Botão de Chamada (CTA)
        const btnW = Math.round(w * 0.52);
        const btnH = 52;
        const btnX = (w - btnW) / 2;
        const btnY = footerY + 60;

        ctx.fillStyle = '#c8a86b';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 26);
        ctx.fill();

        ctx.fillStyle = '#040a17';
        ctx.font = `600 ${Math.round(w * 0.027)}px Jost, sans-serif`;
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
        <div style={{ display: 'flex', itemsCenter: 'center', gap: '10px' }}>
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

          {/* SELEÇÃO E NAVEGAÇÃO DE TÍTULO DA FOTO */}
          <div>
            <div className="nav-header" style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Frase Título (Foto)</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevTopCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextTopCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <div className="note">
              <strong style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--cream)', display: 'block' }}>
                &ldquo;{currentCaseObj.topCaptions[topCaptionIndex]}&rdquo;
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--gold)', opacity: 0.8 }}>
                Opção {topCaptionIndex + 1} de {currentCaseObj.topCaptions.length}
              </span>
            </div>
          </div>

          {/* SELEÇÃO E NAVEGAÇÃO DA LEGENDA */}
          <div>
            <div className="nav-header" style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Legenda Sugerida</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevPostCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextPostCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <div className="note">
              <p style={{ fontSize: '12px', color: 'var(--cream)', lineHeight: '1.4' }}>
                {currentCaseObj.postCaptions[postCaptionIndex]}
              </p>
              <span style={{ fontSize: '10px', color: 'var(--gold)', opacity: 0.8 }}>
                Opção {postCaptionIndex + 1} de {currentCaseObj.postCaptions.length}
              </span>
            </div>
          </div>

          {/* INSTRUÇÕES COMPLEMENTARES DAS RESPOSTAS */}
          <div style={{ borderTop: '1px solid var(--gold-d)', paddingTop: '10px', display: 'grid', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--gold)' }}>
              ✍️ Detalhes do Caso (Complementam o texto selecionado):
            </span>

            <label>
              1. Qual o perfil do paciente ou objetivo do caso? (Complementa o Título)
              <input 
                type="text" 
                value={patientContext} 
                onChange={(e) => setPatientContext(e.target.value)}
                placeholder="Ex: Alinhamento discreto" 
              />
            </label>

            <label>
              2. Ponto principal a destacar no procedimento? (Complementa a Legenda)
              <input 
                type="text" 
                value={procedureHighlights} 
                onChange={(e) => setProcedureHighlights(e.target.value)}
                placeholder="Ex: Sem dor, rápido e com resultado" 
              />
            </label>
          </div>

          {/* Opção Antes e Depois */}
          <div style={{ display: 'flex', itemsCenter: 'center', gap: '8px', fontSize: '12px', color: 'var(--gold-l)' }}>
            <input 
              type="checkbox" 
              id="beforeAfterCheck" 
              checked={useBeforeAfter} 
              onChange={(e) => setUseBeforeAfter(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: 'var(--gold)' }}
            />
            <label htmlFor="beforeAfterCheck" style={{ cursor: 'pointer', margin: 0 }}>
              Exibir divisória "Antes e Depois" (requer 2 fotos)
            </label>
          </div>

          {/* Upload de Fotos */}
          <label>
            Fotos do Caso
            <div className="drop" onClick={() => document.getElementById('fileInput').click()}>
              {selectedImages.length > 0 ? (
                <span>{selectedImages.length} foto(s) anexada(s). Clique para adicionar mais.</span>
              ) : (
                <span>Clique aqui para selecionar as fotos</span>
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

        {/* Preview Mobile */}
        <div className="stage">
          <div className="preview-card">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', itemsCenter: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--gold-l)', textTransform: 'uppercase' }}>
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
                  &ldquo;{getDisplayTopCaption()}&rdquo;
                </p>
              </div>

              <div style={{ flex: 1, position: 'relative', background: '#000', display: 'flex', flexDirection: 'column' }}>
                {selectedImages.length > 0 ? (
                  useBeforeAfter && selectedImages.length >= 2 ? (
                    <>
                      <div style={{ flex: 1, position: 'relative', borderBottom: '2px solid var(--gold)' }}>
                        <img src={selectedImages[0].url} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '6px', left: '6px', background: 'var(--deep)', border: '1px solid var(--gold)', color: 'var(--gold-l)', fontSize: '8px', padding: '2px 6px', fontWeight: 'bold' }}>ANTES</span>
                      </div>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <img src={selectedImages[1].url} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '6px', left: '6px', background: 'var(--deep)', border: '1px solid var(--gold)', color: 'var(--gold-l)', fontSize: '8px', padding: '2px 6