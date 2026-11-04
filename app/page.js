'use client';

import { useState } from 'react';
import { BRAND, DENTAL_CASES, FORMAT_OPTIONS } from '../lib/brand';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState(DENTAL_CASES[0].id);
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[2].id); // Story 9:16 como padrão
  const [selectedImages, setSelectedImages] = useState([]);
  const [useBeforeAfter, setUseBeforeAfter] = useState(false);

  // Seleção e Navegação de Frases
  const [topCaptionIndex, setTopCaptionIndex] = useState(0);
  const [postCaptionIndex, setPostCaptionIndex] = useState(0);

  // Edição Livre
  const [customTopCaption, setCustomTopCaption] = useState('');
  const [customPostCaption, setCustomPostCaption] = useState('');
  const [customCta, setCustomCta] = useState('');

  // Perguntas de Contexto para a IA
  const [patientContext, setPatientContext] = useState('');
  const [procedureHighlights, setProcedureHighlights] = useState('');

  const [isRendering, setIsRendering] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);

  const currentCaseObj = DENTAL_CASES.find(c => c.id === selectedCase) || DENTAL_CASES[0];
  const currentFormatObj = FORMAT_OPTIONS.find(f => f.id === selectedFormat) || FORMAT_OPTIONS[2];

  const handleCaseChange = (e) => {
    setSelectedCase(e.target.value);
    setTopCaptionIndex(0);
    setPostCaptionIndex(0);
    setCustomTopCaption('');
    setCustomPostCaption('');
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
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, {
          file,
          url: reader.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Textos finais com prioridade de edição ou geração
  const activeTopCaption = customTopCaption.trim() || currentCaseObj.topCaptions[topCaptionIndex];
  const activePostCaption = customPostCaption.trim() || currentCaseObj.postCaptions[postCaptionIndex];
  const activeCta = customCta.trim() || "Agende sua avaliação";

  // Gerador Inteligente por IA baseado nos campos
  const handleAIGenerateText = () => {
    let topText = `Volte a sorrir com ${patientContext.trim() || "confiança"}.`;
    let postText = procedureHighlights.trim() 
      ? `${procedureHighlights.trim()}. Um novo sorriso começa com cuidado e precisão.` 
      : "Naturalidade · Harmonia · Qualidade";

    setCustomTopCaption(topText);
    setCustomPostCaption(postText);
  };

  // Envio para a Manus e Abertura do Modal de Previsão UHD
  const handleGeneratePost = async () => {
    if (selectedImages.length === 0) {
      alert('Por favor, anexe pelo menos uma foto para o post.');
      return;
    }

    setIsRendering(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: selectedImages.map(img => img.url),
          caseType: selectedCase,
          topCaption: activeTopCaption,
          postCaption: activePostCaption,
          ctaText: activeCta,
          format: selectedFormat,
          useBeforeAfter,
          patientContext,
          procedureHighlights
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no processamento da imagem.');

      setGeneratedImageUrl(data.imageUrl || selectedImages[0].url);
      setPreviewModalOpen(true);
    } catch (err) {
      alert('Erro ao gerar post: ' + err.message);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.download = `post-${selectedCase}-${selectedFormat}-UHD.png`;
    link.href = generatedImageUrl;
    link.click();
  };

  return (
    <div className="wrap">
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

          {/* PERGUNTAS DA IA */}
          <div style={{ borderTop: '1px solid var(--gold-d)', paddingTop: '10px', display: 'grid', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--gold)' }}>
              🤖 Instruções do Caso para a IA:
            </span>

            <label>
              1. Qual o perfil do paciente ou objetivo do caso?
              <input 
                type="text" 
                value={patientContext} 
                onChange={(e) => setPatientContext(e.target.value)}
                placeholder="Ex: Confiança, estética natural, dentes alinhados..." 
              />
            </label>

            <label>
              2. Ponto principal a destacar no procedimento?
              <input 
                type="text" 
                value={procedureHighlights} 
                onChange={(e) => setProcedureHighlights(e.target.value)}
                placeholder="Ex: Sem dor, agilidade, máxima precisão..." 
              />
            </label>

            <button 
              type="button" 
              className="btn ghost" 
              onClick={handleAIGenerateText}
              style={{ width: '100%', borderColor: 'var(--gold)', color: 'var(--gold-l)', marginTop: '4px' }}
            >
              ✨ Processar Textos com a IA
            </button>
          </div>

          {/* NAVEGAÇÃO DE TÍTULO */}
          <div>
            <div className="nav-header" style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Frase Título (Superior)</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevTopCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextTopCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <input 
              type="text" 
              value={activeTopCaption}
              onChange={(e) => setCustomTopCaption(e.target.value)}
              placeholder="Digite o título ou use as setas..."
            />
          </div>

          {/* NAVEGAÇÃO DE LEGENDA */}
          <div>
            <div className="nav-header" style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Legenda / Destaques</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevPostCaption}>&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextPostCaption}>Próxima &rsaquo;</button>
              </div>
            </div>
            <textarea 
              rows="2"
              value={activePostCaption}
              onChange={(e) => setCustomPostCaption(e.target.value)}
              placeholder="Digite a legenda ou use as setas..."
            />
          </div>

          <label>
            Texto do Botão (CTA)
            <input 
              type="text" 
              value={activeCta}
              onChange={(e) => setCustomCta(e.target.value)}
              placeholder="Ex: Agende sua avaliação"
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
              Ativar modo "Antes e Depois" (requer 2 fotos)
            </label>
          </div>

          <label>
            Fotos do Caso Clínico
            <div className="drop" onClick={() => document.getElementById('fileInput').click()}>
              {selectedImages.length > 0 ? (
                <span>{selectedImages.length} foto(s) anexada(s). Clique para gerenciar.</span>
              ) : (
                <span>Clique aqui para selecionar as fotos em alta definição</span>
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

          <button className="btn" onClick={handleGeneratePost} disabled={isRendering}>
            {isRendering ? 'Renderizando Arte UHD...' : '⚡ Gerar Post Final em Resolução UHD'}
          </button>

        </div>

        {/* PREVIEW EM TEMPO REAL FIEL AO EXEMPLO DE REFERÊNCIA */}
        <div className="stage">
          <div className="preview-card">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--gold-l)', textTransform: 'uppercase' }}>
                Preview Fiel do Layout
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gold)' }}>
                {currentFormatObj.label.split(" ")[0]}
              </span>
            </div>

            {/* CARD FIEL À REFERÊNCIA */}
            <div 
              className="preview-container" 
              style={{ 
                aspectRatio: currentFormatObj.ratio, 
                border: '1px solid var(--gold)', 
                borderRadius: '16px',
                padding: '24px 16px',
                background: 'var(--deep)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                alignItems: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
              }}
            >
              
              {/* TOPO: LOGO + NOME + CATEGORIA + TÍTULO */}
              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/logo-gold.png" alt="Logo" style={{ height: '22px', width: 'auto' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--cream)' }}>Dr. {BRAND.name}</span>
                </div>

                <span style={{ fontSize: '9px', color: 'var(--gold)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>
                  {currentCaseObj.categoryTitle}
                </span>

                <div style={{ width: '40px', height: '1px', background: 'var(--gold-d)', margin: '4px 0' }} />

                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--cream)', fontWeight: '500', lineHeight: '1.2', margin: '4px 0' }}>
                  &ldquo;{activeTopCaption}&rdquo;
                </h2>
              </div>

              {/* MOLDURA CENTRAL DA FOTO / ANTES E DEPOIS */}
              <div 
                style={{ 
                  width: '100%', 
                  flex: 1, 
                  margin: '12px 0', 
                  border: '1px solid var(--gold-d)', 
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
                      <div style={{ flex: 1, position: 'relative', borderBottom: '1px solid var(--gold-d)' }}>
                        <img src={selectedImages[0].url} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(4, 10, 23, 0.9)', border: '1px solid var(--gold)', color: 'var(--gold-l)', fontSize: '8px', padding: '2px 8px', fontWeight: 'bold', borderRadius: '3px' }}>ANTES</span>
                      </div>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <img src={selectedImages[1].url} alt="Depois" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(4, 10, 23, 0.9)', border: '1px solid var(--gold)', color: 'var(--gold-l)', fontSize: '8px', padding: '2px 8px', fontWeight: 'bold', borderRadius: '3px' }}>DEPOIS</span>
                      </div>
                    </>
                  ) : (
                    <img src={selectedImages[0].url} alt="Caso" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )
                ) : (
                  <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--gold-d)', fontSize: '11px', textAlign: 'center', padding: '16px' }}>
                    Anexe as fotos para visualizar o enquadramento na moldura
                  </div>
                )}
              </div>

              {/* RODAPÉ: VALORES + FRASE + BOTÃO PILL + CREDENCIAIS */}
              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontSize: '10px', color: 'var(--gold-l)', letterSpacing: '1px' }}>
                  Naturalidade &bull; Harmonia &bull; Qualidade
                </p>

                <p style={{ fontSize: '11px', color: 'var(--cream)', opacity: 0.9, lineHeight: '1.2' }}>
                  {activePostCaption}
                </p>

                <div 
                  style={{ 
                    background: 'linear-gradient(135deg, var(--gold-l), var(--gold) 55%, var(--gold-d))', 
                    color: 'var(--deep)', 
                    padding: '8px 24px', 
                    borderRadius: '999px', 
                    fontSize: '11px', 
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(200, 168, 107, 0.3)',
                    marginTop: '2px'
                  }}
                >
                  {activeCta}
                </div>

                <p style={{ fontSize: '9px', color: 'var(--gold)', opacity: 0.7, marginTop: '2px' }}>
                  {BRAND.name} &bull; {BRAND.cro}
                </p>
              </div>

            </div>

            <button className="btn" onClick={handleGeneratePost} style={{ width: '100%', marginTop: '6px' }}>
              🔍 Gerar Arte Final em Resolução UHD
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
            maxWidth: '460px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '18px',
            display: 'grid', gap: '14px', justifyItems: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--gold-l)' }}>
                Arte Final em Alta Definição (UHD)
              </h3>
              <button onClick={() => setPreviewModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--gold)', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {generatedImageUrl && (
              <img src={generatedImageUrl} alt="Render Manus UHD" style={{ width: '100%', height: 'auto', borderRadius: '10px', border: '1px solid var(--gold-d)' }} />
            )}

            <div style={{ width: '100%', display: 'grid', gap: '8px' }}>
              <button className="btn" onClick={handleDownloadImage} style={{ width: '100%' }}>
                ⬇️ Baixar Imagem UHD (.PNG)
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