'use client';

import { useState } from 'react';
import { BRAND, DENTAL_CASES } from '../lib/brand';

export default function Home() {
  const [selectedCase, setSelectedCase] = useState(DENTAL_CASES[0].id);
  const [selectedImages, setSelectedImages] = useState([]);
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  const currentCaseObj = DENTAL_CASES.find(c => c.id === selectedCase) || DENTAL_CASES[0];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setSelectedImages(prev => [...prev, ...newImagePreviews]);
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
          customNotes 
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
      {/* Header */}
      <header>
        <div>
          <h1>Central de Posts &middot; Odontologia</h1>
          <p>{BRAND.name} &bull; {BRAND.cro} &bull; {BRAND.especialist}</p>
        </div>
      </header>

      {/* Grid Principal */}
      <div className="grid">
        
        {/* Painel de Controles */}
        <div className="panel">
          
          {/* Seletor de Caso Clínico */}
          <label>
            Selecione o Caso Clínico / Procedimento
            <select 
              value={selectedCase} 
              onChange={(e) => setSelectedCase(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--deep)',
                color: 'var(--cream)',
                border: '1px solid var(--gold-d)',
                borderRadius: '10px',
                padding: '12px 14px',
                font: 'inherit',
                fontSize: '15px'
              }}
            >
              {DENTAL_CASES.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>

          {/* Legenda Superior Dinâmica */}
          <div className="note">
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: '4px', color: 'var(--gold)' }}>
              Legenda Superior Dinâmica:
            </span>
            <strong style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--cream)' }}>
              &ldquo;{currentCaseObj.topCaption}&rdquo;
            </strong>
          </div>

          {/* Área de Upload de Múltiplas Fotos */}
          <label>
            Fotos do Caso (Múltiplas Imagens com Enquadramento Inteligente)
            <div className="drop" onClick={() => document.getElementById('fileInput').click()}>
              {selectedImages.length > 0 ? (
                <span>{selectedImages.length} foto(s) selecionada(s). Clique para adicionar mais.</span>
              ) : (
                <span>Clique aqui para carregar as fotos do caso clínico</span>
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

          {/* Prévia das Imagens Selecionadas */}
          {selectedImages.length > 0 && (
            <div className="row">
              {selectedImages.map((img, index) => (
                <div key={index} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gold-d)' }}>
                  <img src={img.url} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeImage(index)}
                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notas Adicionais */}
          <label>
            Observações Adicionais para a IA
            <textarea 
              rows="3"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Ex: Destacar o conforto, tecnologia 3D, etc."
            />
          </label>

          {/* Botão de Ação */}
          <button 
            className="btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Processando IA e Enquadramento...' : 'Gerar Post Completo'}
          </button>

          {/* Mensagem de Erro ou Sucesso */}
          {generatedResult && (
            <div className="note" style={{ borderColor: 'var(--gold-l)' }}>
              <p style={{ fontWeight: '500', color: 'var(--gold-l)' }}>Sucesso!</p>
              <p style={{ fontSize: '13px' }}>{generatedResult.message} ({generatedResult.totalImagens} imagens processadas)</p>
            </div>
          )}

        </div>

        {/* Painel de Preview / Stage */}
        <div className="stage">
          <div className="out">
            <div className="panel" style={{ textAlign: 'center', background: 'var(--deep)', borderStyle: 'dashed' }}>
              <p style={{ fontSize: '13px', color: 'var(--gold-l)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Preview do Post em Tempo Real
              </p>
              
              <div style={{ background: 'var(--navy)', borderRadius: '12px', padding: '16px', border: '1px solid var(--gold-d)', textAlign: 'left', display: 'grid', gap: '12px' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--gold-d)', paddingBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--gold-l)' }}>
                    {currentCaseObj.topCaption}
                  </span>
                </div>

                <div style={{ aspectRatio: '1/1', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedImages.length > 0 ? (
                    <img src={selectedImages[0].url} alt="Post preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--gold-d)' }}>A imagem enquadrada aparecerá aqui</span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--cream)', lineHeight: '1.4' }}>
                  <p style={{ fontWeight: '500', color: 'var(--gold)' }}>{BRAND.name} &bull; {BRAND.cro}</p>
                  <p style={{ marginTop: '4px', opacity: 0.8 }}>Transformando sorrisos com excelência. Agende sua avaliação.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}