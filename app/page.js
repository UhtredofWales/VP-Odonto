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
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <header className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Central de Posts · Odontologia</h1>
            <p className="text-sm text-slate-500">{BRAND.name} — {BRAND.cro}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
            Modo IA Ativo
          </span>
        </header>

        {/* Painel Principal de Configuração */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          
          {/* Seletor de Casos Clínicos */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Selecione o Caso Clínico / Procedimento:
            </label>
            <select 
              value={selectedCase} 
              onChange={(e) => setSelectedCase(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            >
              {DENTAL_CASES.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          {/* Legenda Superior Dinâmica */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-xl p-4">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block mb-1">
              Legenda Superior Dinâmica (Automática):
            </span>
            <p className="text-base font-bold text-sky-900">
              "{currentCaseObj.topCaption}"
            </p>
          </div>

          {/* Upload de Múltiplas Fotos com Enquadramento Inteligente */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fotos do Caso (Selecione uma ou mais fotos):
            </label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50"
            />
            
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {selectedImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm group">
                    <img src={img.url} alt={`Preview ${index}`} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button 
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white rounded-full p-1.5 text-xs font-bold hover:bg-red-600 shadow"
                        title="Remover foto"
                      >
                        ✕ Remover
                      </button>
                    </div>
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                      ✨ IA Enquadrada
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações Opcionais */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Observações Adicionais para a IA (Opcional):
            </label>
            <textarea 
              rows="3"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Ex: Destacar o uso de materiais importados, tempo de tratamento, etc."
              className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-sm"
            />
          </div>

          {/* Botão de Ação */}
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3.5 rounded-xl transition shadow-md shadow-sky-600/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processando Enquadramento Inteligente...' : 'Gerar Post Completo'}
          </button>

          {/* Feedback de Sucesso */}
          {generatedResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 space-y-1">
              <p className="font-semibold text-sm">✅ Sucesso!</p>
              <p className="text-xs text-emerald-700">{generatedResult.message}</p>
              <p className="text-xs text-emerald-600">Total de fotos processadas: {generatedResult.totalImagens}</p>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}