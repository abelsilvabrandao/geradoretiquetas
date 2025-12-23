
import React, { useState } from 'react';
import { Client } from '../types';

interface ClientManagerProps {
  clients: Client[];
  onSave: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({ clients, onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({ name: '', cnpj: '', logo: '' });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewClient(prev => ({ ...prev, logo: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (newClient.name && newClient.cnpj) {
      onSave({
        id: Math.random().toString(36).substr(2, 9),
        name: newClient.name,
        cnpj: newClient.cnpj.replace(/\D/g, ''),
        logo: newClient.logo || ''
      } as Client);
      setNewClient({ name: '', cnpj: '', logo: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in px-4 sm:px-0 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Emitentes Cadastrados</h2>
          <p className="text-slate-500 text-sm">Configure os logotipos para cada CNPJ emissor.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Novo Cliente
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Razão Social</label>
              <input 
                type="text" 
                value={newClient.name}
                onChange={e => setNewClient(p => ({...p, name: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Nome da Empresa"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">CNPJ</label>
              <input 
                type="text" 
                value={newClient.cnpj}
                onChange={e => setNewClient(p => ({...p, cnpj: e.target.value}))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Logotipo Corporativo</label>
              <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm shrink-0">
                  {newClient.logo ? <img src={newClient.logo} className="max-w-full max-h-full object-contain" /> : <svg className="w-6 h-6 text-slate-200" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /></svg>}
                </div>
                <input type="file" onChange={handleLogoUpload} accept="image/*" className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-bold text-slate-400">Cancelar</button>
            <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100">Salvar Dados</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl opacity-40">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Nenhum emitente configurado</p>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                {client.logo ? <img src={client.logo} className="max-w-full max-h-full object-contain" /> : <span className="text-[8px] font-bold text-slate-300 uppercase">S/L</span>}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-xs font-black text-slate-800 uppercase truncate tracking-tight">{client.name}</h3>
                <p className="text-[10px] font-mono text-slate-400">{client.cnpj}</p>
              </div>
              <button 
                onClick={() => onDelete(client.id)}
                className="p-2 text-slate-300 hover:text-red-500 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientManager;
