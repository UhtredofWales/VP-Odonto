'use client';

import { useState } from 'react';
import { BRAND, DENTAL_CASES, FORMAT_OPTIONS } from '../lib/brand';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState(DENTAL_CASES[0].id);
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[2].id); // Story 9:16 padrão
  const [selectedImages, setSelectedImages] = useState([]);
  const [useBeforeAfter, setUseBeforeAfter] = useState(true);

  // Navegação de índices do catálogo
  const [topCaptionIndex, setTopCaptionIndex] = useState(0);
  const [postCaptionIndex, setPostCaptionIndex] = useState(0);

  // Campos Totalmente Editáveis
  const currentCaseObj = DENTAL_CASES.find(c => c.id === selectedCase) || DENTAL_CASES[0];
  const [customCategory, setCustomCategory] = useState(currentCaseObj.categoryTitle);
  const [customTopCaption, setCustomTopCaption] = useState(currentCaseObj.topCaptions[0]);
  const [customPostCaption, setCustomPostCaption] = useState(currentCaseObj.postCaptions[0]);
  const [customCta, setCustomCta] = useState("Agende sua avaliação");

  // Contexto para a IA especializada
  const [patientContext, setPatientContext] = useState('');
  const [procedureHighlights, setProcedureHighlights] = useState('');

  const currentFormatObj = FORMAT_OPTIONS.find(f => f.id === selectedFormat) || FORMAT_OPTIONS[2];

  const handleCaseChange = (e) => {
    const newCaseId = e.target.value;
    setSelectedCase(newCaseId);
    setTopCaptionIndex(0);
    setPostCaptionIndex(0);
    const newObj = DENTAL_CASES.find(c => c.id === newCaseId);
    setCustomCategory(newObj.categoryTitle);
    setCustomTopCaption(newObj.topCaptions[0]);
    setCustomPostCaption(newObj.postCaptions[0]);
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, { url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // IA Especializada Odontológica
  const handleAIGenerateText = () => {
    const refinedTop = patientContext.trim() 
      ? `Transformação estética focada em ${patientContext.trim()}.` 
      : `Excelência e precisão em ${currentCaseObj.label.toLowerCase()}.`;

    const refinedPost = procedureHighlights.trim() 
      ? `${procedureHighlights.trim()}. Devolva a harmonia e a jovialidade ao seu sorriso com segurança e planejamento digital.` 
      : `Planejamento reabilitador personalizado para garantir naturalidade, função e estética impecável.`;

    setCustomTopCaption(refinedTop);
    setCustomPostCaption(refinedPost);
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

          {/* IA ESPECIALIZADA */}
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
                placeholder="Ex: reabilitação estética, dentes desalinhados..." 
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
              ✨ Gerar Textos Especializados com IA
            </button>
          </div>

          {/* CATEGORIA EDITÁVEL */}
          <label>
            Subtítulo / Categoria (Ex: LENTES DE CONTATO)
            <input 
              type="text" 
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          </label>

          {/* TÍTULO EDITÁVEL + NAVEGAÇÃO */}
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

          {/* LEGENDA EDITÁVEL + NAVEGAÇÃO */}
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
              Ativar modo "Antes e Depois" (Padrão simétrico em 2 fotos)
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

        </div>

        {/* PREVIEW EM TEMPO REAL COM TAMANHO PADRÃO SIMÉTRICO */}
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

            {/* ARTE FINAL COM TAMANHOS DE FOTO PADRONIZADOS */}
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

              {/* MOLDURA CENTRAL COM TAMANHOS DE FOTO IGUAIS E SIMÉTRICOS */}
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
                      {/* Foto ANTES com tamanho exato de 50% */}
                      <div style={{ height: '50%', width: '100%', position: 'relative', borderBottom: '1px solid #c8a86b', overflow: 'hidden' }}>
                        <img 
                          src={selectedImages[0].url} 
                          alt="Antes" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
                        />
                        <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#040a17', border: '1px solid #c8a86b', color: '#e6cf9d', fontSize: '9px', padding: '3px 9px', fontWeight: 'bold', borderRadius: '3px' }}>ANTES</span>
                      </div>
                      {/* Foto DEPOIS com tamanho exato de 50% */}
                      <div style={{ height: '50%', width: '100%', position: 'relative', overflow: 'hidden' }}>
                        <img 
                          src={selectedImages[1].url} 
                          alt="Depois" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
                        />
                        <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#040a17', border: '1px solid #c8a86b', color: '#e6cf9d', fontSize: '9px', padding: '3px 9px', fontWeight: 'bold', borderRadius: '3px' }}>DEPOIS</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                      <img 
                        src={selectedImages[0].url} 
                        alt="Caso" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
                      />
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
                  Naturalidade &bull; Harmonia &bull; Qualidade
                </p>

                <p style={{ fontSize: '11px', color: '#f3ece0', opacity: 0.9, lineHeight: '1.3' }}>
                  {customPostCaption}
                </p>

                <div 
                  style={{ 
                    background: 'linear-gradient(135deg, #e6cf9d, #c8a