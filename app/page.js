'use client';

import { useState } from 'react';
import { BRAND, DENTAL_CASES, FORMAT_OPTIONS } from '../lib/brand';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState(DENTAL_CASES[0].id);
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[0].id);
  const [selectedImages, setSelectedImages] = useState([]);
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  // Índices para variação de frases e legendas
  const [topCaptionIndex, setTopCaptionIndex] = useState(0);
  const [postCaptionIndex, setPostCaptionIndex] = useState(0);

  const currentCaseObj = DENTAL_CASES.find(c => c.id === selectedCase) || DENTAL_CASES[0];
  const currentFormatObj = FORMAT_OPTIONS.find(f => f.id === selectedFormat) || FORMAT_OPTIONS[0];

  // Alterna o caso zerando os índices
  const handleCaseChange = (e) => {
    setSelectedCase(e.target.value);
    setTopCaptionIndex(0);
    setPostCaptionIndex(0);
  };

  // Navegação do Título
  const prevTopCaption = () => {
    setTopCaptionIndex(prev => (prev === 0 ? currentCaseObj.topCaptions.length - 1 : prev - 1));
  };
  const nextTopCaption = () => {
    setTopCaptionIndex(prev => (prev === currentCaseObj.topCaptions.length - 1 ? 0 : prev + 1));
  };

  // Navegação da Legenda
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

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          images: selectedImages.map(img => img.name), 
          caseType: selectedCase,
          format: selectedFormat,
          topCaption: currentCaseObj.topCaptions[topCaptionIndex],
          postCaption: currentCaseObj.postCaptions[postCaptionIndex],
          customNotes,
          resolution: `${currentFormatObj.width}x${currentFormatObj.height} UHD`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar');

      setGeneratedResult(data);
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap">
      <header>
        <div>
          <h1>Central de Posts &middot; Odontologia</h1>
          <p>{BRAND.name} &bull; {BRAND.cro} &bull; {BRAND.especialist}</p>
        </div>
        <span className="uhd-badge">QUALIDADE UHD ATIVA</span>
      </header>

      <div className="grid">
        <div className="panel">
          
          {/* Formato da Imagem */}
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

          {/* Caso Clínico */}
          <label>
            Caso Clínico / Procedimento
            <select value={selectedCase} onChange={handleCaseChange}>
              {DENTAL_CASES.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          {/* Opções da Frase Título (Legenda Superior) */}
          <div>
            <div className="nav-header">
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Frase Título (Superposição)</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevTopCaption} title="Anterior">&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextTopCaption} title="Próxima">Próxima &rsaquo;</button>
              </div>
            </div>
            <div className="note">
              <strong style={{ fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--cream)', display: 'block' }}>
                &ldquo;{currentCaseObj.topCaptions[topCaptionIndex]}&rdquo;
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--gold)', opacity: 0.8 }}>
                Opção {topCaptionIndex + 1} de {currentCaseObj.topCaptions.length}
              </span>
            </div>
          </div>

          {/* Opções da Legenda do Post */}
          <div>
            <div className="nav-header">
              <span style={{ fontSize: '13px', color: 'var(--gold-l)' }}>Legenda do Post</span>
              <div className="row" style={{ gap: '4px' }}>
                <button type="button" className="btn ghost" onClick={prevPostCaption} title="Anterior">&lsaquo; Voltar</button>
                <button type="button" className="btn ghost" onClick={nextPostCaption} title="Próxima">Próxima &rsaquo;</button>
              </div>
            </div>
            <div className="note">
              <p style={{ fontSize: '13px', color: 'var(--cream)', lineHeight: '1.4' }}>
                {currentCaseObj.postCaptions[postCaptionIndex]}
              </p>
              <span style={{ fontSize: '10px', color: 'var(--gold)', opacity: 0.8 }}>
                Opção {postCaptionIndex + 1} de {currentCaseObj.postCaptions.length}
              </span>
            </div>
          </div>

          {/* Upload de Imagens */}
          <label>
            Fotos do Caso (Enquadramento Automático IA)
            <div className="drop" onClick={() => document.getElementById('fileInput').click()}>
              {selectedImages.length > 0 ? (
                <span>{selectedImages.length} foto(s) pronta(s). Clique para adicionar mais.</span>
              ) : (
                <span>Clique aqui para selecionar as fotos em alta resolução</span>
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
                <div key={index} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gold-d)' }}>
                  <img src={img.url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notas Extras */}
          <label>
            Instruções Adicionais
            <textarea 
              rows="2"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Instruções específicas para a imagem ou texto..."
            />
          </label>

          <button className="btn" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Gerando em Resolução UHD...' : `Gerar Post ${currentFormatObj.label.split(" ")[0]} UHD`}
          </button>

          {generatedResult && (
            <div className="note" style={{ borderColor: 'var(--gold-l)' }}>
              <p style={{ fontWeight: '500', color: 'var(--gold-l)' }}>✅ Post gerado em UHD com sucesso!</p>
              <p style={{ fontSize: '12px' }}>{generatedResult.message}</p>
            </div>
          )}

        </div>

        {/* Stage / Preview Harmônico */}
        <div className="stage">
          <div className="preview-card">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--gold-l)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Preview Proporcional: {currentFormatObj.label}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gold)' }}>
                {currentFormatObj.width} x {currentFormatObj.height} px
              </span>
            </div>

            <div className="preview-container" style={{ aspectRatio: currentFormatObj.ratio }}>
              
              {/* Header do Post */}
              <div style={{ padding: '12px 16px', background: 'var(--navy)', borderBottom: '1px solid var(--gold-d)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--deep)', fontWeight: 'bold', fontSize: '12px' }}>
                  VP
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--cream)' }}>{BRAND.name}</p>
                  <p style={{ fontSize: '10px', color: 'var(--gold)' }}>{BRAND.cro}</p>
                </div>
              </div>

              {/* Título Sobreposto / Superior */}
              <div style={{ padding: '12px 16px', background: 'rgba(6, 18, 42, 0.85)', backdropFilter: 'blur(4px)', borderBottom: '1px solid rgba(200, 168, 107, 0.3)', textAlign: 'center', zIndex: 2 }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: selectedFormat === 'story' ? '20px' : '16px', color: 'var(--gold-l)', fontWeight: '600' }}>
                  &ldquo;{currentCaseObj.topCaptions[topCaptionIndex]}&rdquo;
                </span>
              </div>

              {/* Área de Imagem Utilizando Todo o Espaço */}
              <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedImages.length > 0 ? (
                  <img src={selectedImages[0].url} alt="Caso" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--gold-d)', textAlign: 'center', padding: '20px' }}>
                    Sua foto enquadrada automaticamente ocupará todo esse espaço ({currentFormatObj.width}x{currentFormatObj.height})
                  </span>
                )}
              </div>

              {/* Footer do Post */}
              <div style={{ padding: '12px 16px', background: 'var(--navy)', borderTop: '1px solid var(--gold-d)', zIndex: 2 }}>
                <p style={{ fontSize: '11px', color: 'var(--cream)', lineHeight: '1.3' }}>
                  <strong style={{ color: 'var(--gold)' }}>{BRAND.name}</strong> {currentCaseObj.postCaptions[postCaptionIndex]}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}