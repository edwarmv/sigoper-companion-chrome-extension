import { useState } from "react";
import { OrdenDespacho as OrdenDespachoType } from "@/models/orden-despacho";
import { formatDate } from "@/utils";
import DetailItem from "./DetailItem";
import styles from "./OrdenDespacho.module.css";

export default function OrdenDespacho({
  ordenDespacho,
}: {
  ordenDespacho: OrdenDespachoType | null;
}) {
  const [error, setError] = useState<string | null>(null);

  function fillOutDespachoCisterna() {
    setError(null);

    const formContainer = document.querySelector<HTMLDivElement>(
      ".Form-Window.Form-DialogWindow",
    );
    const formTitle = formContainer?.querySelector<HTMLSpanElement>(
      ".Form-Top .Common-FrameHeader .Common-MoveCursor.Common-Unselectable .Form-Header.Form-DialogHeader .Common-FontData.Form-HeaderPart.Form-HeaderCaption .nobr",
    );
    if (!formContainer) {
      setError("No se encontró el formulario de despacho.");
      return;
    }

    if (!ordenDespacho) {
      return;
    }

    if (!formTitle) {
      setError("No se pudo identificar el formulario abierto.");
      return;
    }

    if (!formTitle.textContent?.includes("Despacho por Cisterna")) {
      setError("El formulario abierto no es de Despacho por Cisterna.");
      return;
    }
    const inputs = formContainer.querySelectorAll<HTMLInputElement>(
      ".Form-Center .Common-FrameContent .Common-DefaultCursor.Form-WindowBody div div .Panel-Control .Common-Strech div div .GroupBox-Control div .TextBox-TableContainer.TextBox-Control .Common-Input.TextBox-SingleLine.TextBox-Text",
    );
    const licencia = inputs.item(1);
    const placa = inputs.item(0);
    const numeroOrden = inputs.item(8);
    const volDoc = inputs.item(6);
    if (!licencia || !placa || !numeroOrden || !volDoc) {
      setError("No se pudieron localizar todos los campos requeridos.");
      return;
    }
    licencia.value = ordenDespacho.despacho.licencia;
    placa.value = ordenDespacho.despacho.placa;
    numeroOrden.value = ordenDespacho.despacho.numero;
    volDoc.value = ordenDespacho.despacho.cantidad.toString();
  }

  return (
    <>
      {ordenDespacho ? (
        <div className="order-card">
          <div className="order-number">
            <span>Orden</span>
            <strong>#{ordenDespacho.despacho.numero}</strong>
          </div>
          <div className="detail-grid">
            <DetailItem
              label="Producto"
              text={ordenDespacho.despacho.producto}
              wide
            />
            <DetailItem
              label="Cantidad"
              text={`${ordenDespacho.despacho.cantidad} ${ordenDespacho.despacho.unidad_cantidad}`}
            />
            <DetailItem
              label="Despacho programado"
              text={formatDate(
                ordenDespacho.despacho.fecha_despacho_programado,
              )}
            />
            <DetailItem
              label="Despacho efectivo"
              text={formatDate(ordenDespacho.despacho.fecha_despacho_efectivo)}
            />
            <DetailItem
              label="Planta de despacho"
              text={ordenDespacho.despacho.planta_despacho}
            />
            <DetailItem
              label="Conductor"
              text={ordenDespacho.despacho.conductor}
            />
            <DetailItem
              label="Licencia"
              text={ordenDespacho.despacho.licencia}
            />
            <DetailItem label="Placa" text={ordenDespacho.despacho.placa} />
            <DetailItem
              label="Factura"
              text={ordenDespacho.facturacion.numero_factura}
              wide
            />
            <DetailItem
              label="Estado de factura"
              text={ordenDespacho.facturacion.estado_factura}
            />
            <DetailItem label="CUF" text={ordenDespacho.facturacion.cuf} />
            <DetailItem
              label="Fecha de emisión"
              text={formatDate(ordenDespacho.facturacion.fecha_emision)}
            />
            <DetailItem
              label="Razón social"
              text={ordenDespacho.facturacion.nombre_razon_social}
              wide
            />
            <DetailItem
              label="Tipo de documento"
              text={ordenDespacho.facturacion.tipo_documento}
            />
            <DetailItem
              label="Número de documento"
              text={ordenDespacho.facturacion.numero_documento}
            />
            <DetailItem
              label="Código SIREHIDRO"
              text={ordenDespacho.facturacion.codigo_sirehidro}
              wide
            />
          </div>
          <button
            className={styles.primaryButton}
            onClick={fillOutDespachoCisterna}
          >
            Rellenar campos <span>→</span>
          </button>
          {error ? (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">⌁</span>
          <div>
            <strong>Esperando una orden</strong>
            <p>La orden de despacho aparecerá aquí cuando sea recibida.</p>
          </div>
        </div>
      )}
    </>
  );
}
