
import React, { useState, useEffect, useMemo } from 'react';
import { Client, InvoiceData, Label } from './types';
import { parseNfeXml, formatText } from './utils/xmlParser';
import LabelCard from './components/LabelCard';
import ClientManager from './components/ClientManager';

const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [activeTab, setActiveTab] = useState<'process' | 'config'>('process');

  // Persistência local dos clientes
  useEffect(() => {
    const saved = localStorage.getItem('dist_labels_clients');
    if (saved) setClients(JSON.parse(saved));
  }, []);

  const saveClients = (updated: Client[]) => {
    setClients(updated);
    localStorage.setItem('dist_labels_clients', JSON.stringify(updated));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    try {
      const results = await Promise.all(files.map(file => parseNfeXml(file)));
      setInvoices(prev => [...prev, ...results]);
    } catch (err) {
      alert("Falha ao ler XML. Verifique se é uma NF-e válida.");
    } finally {
      e.target.value = '';
    }
  };

  const labels = useMemo(() => {
    const allLabels: Label[] = [];
    invoices.forEach(inv => {
      const issuer = clients.find(c => c.cnpj === inv.issuerCnpj.replace(/\D/g, ''));
      const logo = issuer?.logo || '';
      
      for (let i = 1; i <= inv.totalVolumes; i++) {
        allLabels.push({
          id: `${inv.id}-${i}`,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          issuerName: formatText(inv.issuerName),
          issuerLogo: logo,
          destName: formatText(inv.destName),
          destAddress: formatText(`${inv.destAddress}, ${inv.destNumber}`),
          destNeighborhood: formatText(inv.destNeighborhood),
          destCityUF: formatText(`${inv.destCity}-${inv.destUF}`),
          productCode: formatText(inv.products[0]?.code || 'S/C'),
          productDesc: formatText(inv.products[0]?.description || 'PRODUTO'),
          volumeLabel: `${i}/${inv.totalVolumes}`,
          productVolumeLabel: `V ${i}/${inv.totalVolumes}`,
          barcodeValue: `${inv.invoiceNumber}${i}`
        });
      }
    });
    return allLabels;
  }, [invoices, clients]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Fixo Mobile-First */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 leading-none tracking-tight">LABELMASTER PRO</h1>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">LOGÍSTICA TERCEIRIZADA</span>
            </div>
          </div>

          <nav className="flex bg-slate-100 p-1 rounded-xl">
             <button 
              onClick={() => setActiveTab('process')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'process' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Operação
             </button>
             <button 
              onClick={() => setActiveTab('config')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'config' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Emitentes
             </button>
          </nav>
        </div>
      </header>

      {/* Estatísticas Rápidas (Banner superior) */}
      <section className="bg-slate-900 text-white no-print">
         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between overflow-x-auto gap-8 custom-scrollbar">
            <div className="flex items-center gap-3 shrink-0">
               <div className="text-indigo-400 font-black text-xl">{invoices.length}</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Notas<br/>Carregadas</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <div className="text-white font-black text-xl">{labels.length}</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Total de<br/>Etiquetas</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <div className="text-white font-black text-xl">{clients.length}</div>
               <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Emitentes<br/>Ativos</div>
            </div>
            {labels.length > 0 && (
              <button 
                onClick={() => window.print()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-900/40 transition-all shrink-0 active:scale-95"
              >
                Imprimir Lote
              </button>
            )}
         </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 no-print">
        {activeTab === 'config' ? (
          <ClientManager 
            clients={clients} 
            onSave={(c) => saveClients([...clients, c])} 
            onDelete={(id) => saveClients(clients.filter(x => x.id !== id))}
          />
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Input Gigante para Mobile/Touch */}
            <label className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-3xl bg-white hover:bg-indigo-50 hover:border-indigo-400 transition-all cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Clique para subir os arquivos XML</span>
              </div>
              <input type="file" className="hidden" multiple accept=".xml" onChange={handleFileUpload} />
            </label>

            {/* Listagem de Etiquetas no Visualizador */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Preview de Distribuição</h2>
                  {invoices.length > 0 && (
                    <button onClick={() => setInvoices([])} className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">Limpar Tudo</button>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-y-12 gap-x-6 justify-items-center">
                  {labels.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center opacity-30 italic text-slate-400">
                       <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       <p className="text-sm font-bold uppercase tracking-widest">Aguardando dados de processamento</p>
                    </div>
                  ) : (
                    labels.map(label => (
                      <LabelCard key={label.id} label={label} />
                    ))
                  )}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Área Técnica de Impressão */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
          {labels.map(label => (
            <LabelCard key={label.id} label={label} isPrintMode={true} />
          ))}
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          /* Zoom out do preview em telas pequenas para caber no celular */
          .scale-[0.8] { transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
};

export default App;
