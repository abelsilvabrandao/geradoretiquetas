
export interface Client {
  id: string;
  cnpj: string;
  name: string;
  logo: string; // Base64
}

export interface Product {
  code: string;
  description: string;
  quantity: number;
}

export interface InvoiceData {
  id: string;
  issuerName: string;
  issuerCnpj: string;
  invoiceNumber: string;
  destName: string;
  destAddress: string;
  destNumber: string;
  destNeighborhood: string;
  destCity: string;
  destUF: string;
  products: Product[];
  totalVolumes: number;
  orderNumber: string;
}

export interface Label {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  issuerName: string;
  issuerLogo: string;
  destName: string;
  destAddress: string;
  destNeighborhood: string;
  destCityUF: string;
  productCode: string;
  productDesc: string;
  volumeLabel: string; // e.g., "1 / 5"
  productVolumeLabel: string; // e.g., "1 de 3"
  barcodeValue: string;
}
