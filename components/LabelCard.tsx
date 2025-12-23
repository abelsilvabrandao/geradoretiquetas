
import React, { useEffect, useRef } from 'react';
import { Label } from '../types';

interface LabelCardProps {
  label: Label;
  isPrintMode?: boolean;
}

const LabelCard: React.FC<LabelCardProps> = ({ label, isPrintMode }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      // @ts-ignore
      window.JsBarcode(barcodeRef.current, label.barcodeValue, {
        format: "CODE128",
        width: 1.8,
        height: 45,
        displayValue: false,
        margin: 0,
      });
    }
  }, [label.barcodeValue]);

  // Estilo fixo de 100x70mm para impressão e visualização proporcional
  const containerStyle: React.CSSProperties = {
    width: '100mm',
    height: '70mm',
    backgroundColor: 'white',
    padding: '4mm',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    border: isPrintMode ? 'none' : '1px solid #e2e8f0',
    borderRadius: isPrintMode ? '0' : '12px',
    boxShadow: isPrintMode ? 'none' : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    boxSizing: 'border-box',
    pageBreakAfter: 'always',
  };

  return (
    <div style={containerStyle} className={!isPrintMode ? 'scale-[0.8] sm:scale-100 transition-transform origin-top' : ''}>
      {/* Header Logotipo e Código Barras */}
      <div className="flex gap-3 h-[22mm] border-b border-slate-200 pb-2 overflow-hidden">
        <div className="w-[30mm] h-full flex items-center justify-center bg-slate-50 rounded p-1">
          {label.issuerLogo ? (
            <img src={label.issuerLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-[10px] font-bold text-slate-300 uppercase">Logo</div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
          <svg ref={barcodeRef} className="max-w-full"></svg>
          <span className="text-[9px] font-mono font-bold tracking-[0.2em] mt-1 uppercase text-slate-500">{label.barcodeValue}</span>
        </div>
      </div>

      {/* Meio: Dados do Destinatário */}
      <div className="flex-1 py-2 flex flex-col gap-1">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Destinatário</span>
          <span className="text-[12px] font-extrabold text-slate-900 truncate uppercase leading-none">{label.destName}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Endereço</span>
            <span className="text-[10px] font-medium text-slate-700 truncate leading-tight">{label.destAddress}</span>
            <span className="text-[10px] font-medium text-slate-700 truncate leading-tight">{label.destNeighborhood}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Cidade / UF</span>
            <span className="text-[13px] font-black text-slate-900 leading-tight uppercase">{label.destCityUF}</span>
          </div>
        </div>

        <div className="mt-1 bg-slate-100 rounded px-2 py-1 border border-slate-200">
           <span className="text-[9px] font-black text-indigo-700 truncate block leading-none">
             {label.productCode} — {label.productDesc}
           </span>
        </div>
      </div>

      {/* Footer: NF e Volume */}
      <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-slate-500 uppercase">Nota Fiscal</span>
          <span className="text-[24px] font-black text-slate-900 leading-none tracking-tighter">{label.invoiceNumber}</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-indigo-600 text-white px-3 py-1 rounded text-[10px] font-black uppercase mb-1 tracking-widest">
            {label.volumeLabel}
          </div>
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Distribuição Logística</span>
        </div>
      </div>
    </div>
  );
};

export default LabelCard;
