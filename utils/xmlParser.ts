
import { InvoiceData, Product } from '../types';

export const parseNfeXml = async (file: File): Promise<InvoiceData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const getTagText = (parent: Element | Document, tag: string) => {
          const el = parent.getElementsByTagName(tag)[0];
          return el ? el.textContent || '' : '';
        };

        const emit = xml.getElementsByTagName('emit')[0];
        const dest = xml.getElementsByTagName('dest')[0];
        const enderDest = dest?.getElementsByTagName('enderDest')[0];
        const transport = xml.getElementsByTagName('transp')[0];
        const vol = transport?.getElementsByTagName('vol')[0];

        const products: Product[] = [];
        const dets = Array.from(xml.getElementsByTagName('det'));
        dets.forEach((det) => {
          const prod = det.getElementsByTagName('prod')[0];
          products.push({
            code: getTagText(prod, 'cProd'),
            description: getTagText(prod, 'xProd'),
            quantity: parseFloat(getTagText(prod, 'qCom') || '0'),
          });
        });

        const invoiceData: InvoiceData = {
          id: Math.random().toString(36).substr(2, 9),
          issuerName: getTagText(emit, 'xNome'),
          issuerCnpj: getTagText(emit, 'CNPJ'),
          invoiceNumber: getTagText(xml, 'nNF'),
          destName: getTagText(dest, 'xNome'),
          destAddress: getTagText(enderDest, 'xLgr'),
          destNumber: getTagText(enderDest, 'nro'),
          destNeighborhood: getTagText(enderDest, 'xBairro'),
          destCity: getTagText(enderDest, 'xMun'),
          destUF: getTagText(enderDest, 'UF'),
          products,
          totalVolumes: parseInt(getTagText(vol, 'qVol') || '1'),
          orderNumber: getTagText(xml, 'xPed') || '---',
        };

        resolve(invoiceData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsText(file);
  });
};

export const formatText = (text: string) => {
  let t = text.toUpperCase();
  t = t.replace(/AVENIDA\b/g, 'AV.');
  t = t.replace(/RUA\b/g, 'R.');
  t = t.replace(/RODOVIA\b/g, 'ROD.');
  t = t.replace(/TRAVESSA\b/g, 'TRAV.');
  t = t.replace(/ESTRADA\b/g, 'EST.');
  t = t.replace(/PRACA\b/g, 'PÇA.');
  t = t.replace(/PRAÇA\b/g, 'PÇA.');
  t = t.replace(/SERVIÇOS\b/g, 'SERV.');
  t = t.replace(/COMÉRCIO\b/g, 'COM.');
  return t;
};
