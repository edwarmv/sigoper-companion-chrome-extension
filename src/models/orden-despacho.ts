export interface OrdenDespacho {
  facturacion: Facturacion;
  despacho: Despacho;
}

export interface Despacho {
  numero: string;
  fecha_despacho_programado: Date;
  fecha_despacho_efectivo: Date;
  planta_despacho: string;
  conductor: string;
  licencia: string;
  placa: string;
  producto: string;
  cantidad: number;
  unidad_cantidad: string;
}

export interface Facturacion {
  numero_factura: string;
  estado_factura: string;
  cuf: string;
  fecha_emision: Date;
  nombre_razon_social: string;
  tipo_documento: string;
  numero_documento: string;
  codigo_sirehidro: string;
}
