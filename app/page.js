'use client';

import { useState, useRef } from 'react';
import { BRAND, DENTAL_CASES, FORMAT_OPTIONS } from '../lib/brand';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState(DENTAL_CASES[0].id);
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[0].id);
  const [selectedImages, setSelectedImages] = useState([]);
  
  // Instruções prévias do texto
  const [patientContext, setPatientContext] = useState('');
  const [procedureHighlights, setProcedureHighlights] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Variáveis de navegação de texto
  const [topCaptionIndex, setTopCaptionIndex] = useState(0);
  const [postCaptionIndex, setPostCaptionIndex] = useState(0);

  // Estados de download e preview
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

  // Função para desenhar a arte final em alta resolução (UHD) no Canvas para download
  const renderCanvasPost = () => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject('Canvas não disponível');

      const ctx = canvas.getContext('2d');
      const w = currentFormatObj.width;
      const h = currentFormatObj.height;

      canvas.width = w;
      canvas.height = h;

      // Fundo escuro (Navy / Deep)
      ctx.fillStyle = '#06122a';
      ctx.fillRect(0, 0, w, h);

      const topHeaderHeight = Math.round(h * 0.12);
      const footerHeight = Math.round(h * 0.14);
      const imgHeight = h - topHeaderHeight - footerHeight;

      // Se houver imagem selecionada
      if (selectedImages.length > 0) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedImages[0].url;

        img.onload = () => {
          // Renderiza imagem centralizada mantendo proporção e preenchimento
          const imgAspect = img.width / img.height;
          const targetAspect = w / imgHeight;

          let renderW = w;
          let renderH = imgHeight;
          let offsetX = 0;
          let offsetY = topHeaderHeight;

          if (imgAspect > targetAspect) {
            renderW = imgHeight * imgAspect;
            offsetX = (w - renderW) / 2;
          } else {
            renderH = w / imgAspect;
            offsetY = topHeaderHeight + (imgHeight - renderH) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
          drawOverlaysAndText();
        };

        img.onerror = () => drawOverlaysAndText();
      } else {
        // Sem imagem (Placeholder elegante)
        ctx.fillStyle = '#0a1a33';
        ctx.fillRect(0, topHeaderHeight, w, imgHeight);
        ctx.fillStyle = '#c8a86b';
        ctx.font = `300 ${Math.round(w * 0.035)}px Jost, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('Nenhuma foto anexada', w / 2, topHeaderHeight + imgHeight / 2);
        drawOverlaysAndText();
      }

      function drawOverlaysAndText() {
        // Faixa Superior (Header do Post)
        ctx.fillStyle = '#0a1a33';
        ctx.fillRect(0, 0, w, topHeaderHeight);

        // Moldura em Gold
        ctx.strokeStyle = '#9c7f46';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, topHeaderHeight);
        ctx.lineTo(w, topHeaderHeight);
        ctx.stroke();

        // Texto do Título Superior
        ctx.fillStyle = '#e6cf9d';
        ctx.font = `600 ${Math.round(w * 0.045)}px "Cormorant Garamond", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const captionText = `“${currentCaseObj.topCaptions[topCaptionIndex]}”`;
        ctx.fillText(captionText, w / 2, topHeaderHeight / 2);

        // Faixa Inferior (Rodapé do Post)
        ctx.fillStyle = '#0a1a33';
        ctx.fillRect(0, h - footerHeight, w, footerHeight);

        ctx.beginPath();
        ctx.moveTo(0, h - footerHeight);
        ctx.lineTo(w, h - footerHeight);
        ctx.stroke();

        // Nome do Doutor e CRO no Rodapé
        ctx.fillStyle = '#c8a86b';
        ctx.font = `500 ${Math.round(w * 0.03)}px Jost, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${BRAND.name} • ${BRAND.cro}`, Math.round(w * 0.05), h - footerHeight + 25);

        // Subtexto / Detalhes informados
        ctx.fillStyle = '#f3ece0';
        ctx.font = `300 ${Math.round(w * 0.025)}px Jost, sans-serif`;
        const noteText = procedureHighlights || currentCaseObj.postCaptions[postCaptionIndex];
        ctx.fillText(noteText.slice(0, 80) + '...', Math.round(w * 0.05), h - footerHeight + 65);

        resolve(canvas.toDataURL('image/png'));
      }
    });
  };

  // Abrir Modal de Pré-visualização
  const handleOpenPreview = async () => {
    setIsRendering(true);
    try {
      const dataUrl = await renderCanvasPost();
      setRenderedImageDataUrl(dataUrl);
      setPreviewModalOpen(true);
    } catch (err) {
      alert('Erro ao gerar a pré-visualização: ' + err);
    } finally {
      setIsRendering(false);
    }
  };

  // Efetuar o download direto do arquivo de imagem
  const handleDownloadImage = () => {
    if (!renderedImageDataUrl) return;
    const link = document.createElement('a');
    link.download = `post-${selectedCase}-${selectedFormat}-UHD.png`;
    link.href = renderedImageDataUrl;
    link.click();
  };

  return (
    <div className="wrap">
      {/* Canvas Oculto para Renderização em Altíssima Definição */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header Mobile / Desktop */}
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-gold.png" alt="Logo Gold" style={{ height: '38px', width: 'auto' }} />
          <div>
            <h1>Central de Posts &middot; Odontologia</h1>
            <p>{BRAND.name} &bull; {BRAND.cro}</p>
          </div>
        </div>
        <span className="uhd-badge">UHD 1080p</span>
      </header>

      {/* Grid com visual adaptado e dinâmico para Celular */}
      <div className="grid">
        <div className="panel">
          
          {/* Formato da Imagem */}
          <label>
            Formato da Imagem (Instagram)
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

          {/* PERGUNTAS E INSTRUÇÕES PRÉVIAS DO TEXTO */}
          <div style={{ borderTop: '1px solid var(--gold-d)', paddingTop: '12px', display: 'grid', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--gold)' }}>
              📋 Instruções Prévias do Post:
            </span>

            <label>
              1. Qual o perfil do paciente ou objetivo do caso?
              <input 
                type="text" 
                value={patientContext} 
                onChange={(e) => setPatientContext(e.target.value)}
                placeholder="Ex: Paciente busca estética para casamento, alinhamento discreto..." 
              />
            </label>

            <label>
              2. Ponto principal a destacar no procedimento?
              <input 
                type="text" 
                value={procedureHighlights} 
                onChange={(e) => setProcedureHighlights(e.target.value)}
                placeholder="Ex: Sem dor, agilidade, uso de scanner 3D..." 
              />
            </label>
          </div>

          {/* Navegação de Títulos */}
          <div>
            <div className="nav-header">
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Frase Título (Na Foto)</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevTopCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextTopCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <div className="note">
              <strong style={{ fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--cream)', display: 'block' }}>
                &ldquo;{currentCaseObj.topCaptions[topCaptionIndex]}&rdquo;
              </strong>
            </div>
          </div>

          {/* Navegação da Legenda do Post */}
          <div>
            <div className="nav-header">
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Legenda Sugerida</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevPostCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextPostCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <div className="note">
              <p style={{ fontSize: '13px', color: 'var(--cream)', lineHeight: '1.4' }}>
                {currentCaseObj.postCaptions[postCaptionIndex]}
              </p>
            </div>
          </div>

          {/* Upload de Fotos */}
          <label>
            Fotos do Caso (Upload)
            <div className="drop" onClick={() => document.getElementById('fileInput').click()}>
              {selectedImages.length > 0 ? (
                <span>{selectedImages.length} foto(s) anexada(s). Clique para alterar/adicionar.</span>
              ) : (
                <span>Clique aqui para selecionar as fotos do paciente</span>
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

          {/* Thumbs */}
          {selectedImages.length > 0 && (
            <div className="row">
              {selectedImages.map((img, index) => (
                <div key={index} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gold-d)' }}>
                  <img src={img.url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Botão para Gerar Pré-Visualização */}
          <button className="btn" onClick={handleOpenPreview} disabled={isRendering}>
            {isRendering ? 'Processando Imagem em UHD...' : '👁️ Pré-visualizar Imagem Final'}
          </button>

        </div>

        {/* Stage / Mobile Friendly Area */}
        <div className="stage">
          <div className="preview-card">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--gold-l)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Visão Rápida no Celular
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gold)' }}>
                {currentFormatObj.label.split(" ")[0]}
              </span>
            </div>

            <div className="preview-container" style={{ aspectRatio: currentFormatObj.ratio }}>
              <div style={{ padding: '10px 14px', background: 'var(--navy)', borderBottom: '1px solid var(--gold-d)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/logo-gold.png" alt="Logo Gold" style={{ width: '22px', height: 'auto' }} />
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '500', color: 'var(--cream)' }}>{BRAND.name}</p>
                  <p style={{ fontSize: '9px', color: 'var(--gold)' }}>{BRAND.cro}</p>
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'rgba(6, 18, 42, 0.9)', borderBottom: '1px solid rgba(200, 168, 107, 0.3)', textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--gold-l)', fontWeight: '600' }}>
                  &ldquo;{currentCaseObj.topCaptions[topCaptionIndex]}&rdquo;
                </span>
              </div>

              <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedImages.length > 0 ? (
                  <img src={selectedImages[0].url} alt="Caso" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--gold-d)', textAlign: 'center', padding: '12px' }}>
                    Anexe uma foto para ver a composição
                  </span>
                )}
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--navy)', borderTop: '1px solid var(--gold-d)' }}>
                <p style={{ fontSize: '10px', color: 'var(--cream)', lineHeight: '1.2' }}>
                  <strong style={{ color: 'var(--gold)' }}>{BRAND.name}</strong> {procedureHighlights || currentCaseObj.postCaptions[postCaptionIndex]}
                </p>
              </div>
            </div>

            <button className="btn" onClick={handleOpenPreview} style={{ width: '100%', marginTop: '8px' }}>
              🔍 Abrir Pré-visualização & Download
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE PRÉ-VISUALIZAÇÃO ANTES DE BAIXAR */}
      {previewModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6, 18, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--navy)',
            border: '1px solid var(--gold)',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--gold-l)' }}>
                Pré-visualização da Imagem Final (UHD)
              </h3>
              <button 
                onClick={() => setPreviewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--gold)', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Imagem Pronta Renderizada */}
            {renderedImageDataUrl && (
              <img 
                src={renderedImageDataUrl} 
                alt="Arte Final Renderizada" 
                style={{ width: '100%', height: 'auto', borderRadius: '10px', border: '1px solid var(--gold-d)' }} 
              />
            )}

            <div style={{ width: '100%', display: 'grid', gap: '10px' }}>
              <button className="btn" onClick={handleDownloadImage} style={{ width: '100%' }}>
                ⬇️ Baixar Imagem Agora (.PNG)
              </button>
              <button className="btn ghost" onClick={() => setPreviewModalOpen(false)} style={{ width: '100%' }}>
                Voltar e Ajustar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}