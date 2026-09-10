import Logo from "@/assets/crx.svg";
import { useEffect, useState } from "react";
import "./App.css";
import QRCode from "qrcode";
import { OrdenDespacho } from "@/models/orden-despacho";

const room_id = self.crypto.randomUUID();
const SIGOPER_COMPANION_URL = `https://sigoper-companion-service.localhost/${room_id}`;
type WsConnectionStatus = "connected" | "disconnected" | "connecting";

const WsConnectionStatusLabels = {
  connected: "Conectado",
  disconnected: "Desconectado",
  connecting: "Conectando...",
};

const qrCodeRefCallback = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) return;

  void QRCode.toCanvas(canvas, SIGOPER_COMPANION_URL, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 220,
    color: {
      dark: "#0B5CAB",
      light: "#FFFFFF",
    },
  });
};

const formatDate = (value: Date | string | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("es-BO", { dateStyle: "medium" }).format(date);
};

const formatDateTime = (value: Date | undefined) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(value);
};

function App() {
  const [show, setShow] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [ordenDespacho, setOrdenDespacho] = useState<OrdenDespacho | null>(
    null,
  );
  const [receivedAt, setReceivedAt] = useState<Date | null>(null);
  const [wsConnectionStatus, setWsConnectionStatus] =
    useState<WsConnectionStatus>("connecting");
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  useEffect(() => {
    setWsConnectionStatus("connecting");
    const ws = new WebSocket(
      `wss://sigoper-companion-service.localhost/ws/${room_id}`,
    );
    ws.onopen = () => setWsConnectionStatus("connected");
    ws.onclose = () => setWsConnectionStatus("disconnected");
    ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (parsedData.status !== "success") {
          setOrdenDespacho(null);
          setReceivedAt(null);
        } else if (
          parsedData.action ===
          "extract_information_from_estigia_orden_despacho"
        ) {
          setOrdenDespacho(parsedData.data);
          setReceivedAt(new Date());
        } else {
          setOrdenDespacho(null);
          setReceivedAt(null);
        }
      } catch {
        setOrdenDespacho(null);
        setReceivedAt(null);
      }
    };
    return () => ws.close();
  }, [connectionAttempt]);

  const retryConnection = () => setConnectionAttempt((attempt) => attempt + 1);

  return (
    <div className="sigoper-companion-popup-container">
      {show && (
        <section className="popup-content" aria-label="SIGOPER Companion">
          <header className="panel-header">
            <div className="brand-lockup">
              <img src={Logo} alt="" className="panel-logo" />
              <div>
                <p className="eyebrow">SIGOPER</p>
                <h1>Companion</h1>
              </div>
            </div>
            <button
              className="icon-button"
              onClick={() => setShow(false)}
              aria-label="Cerrar panel"
            >
              ×
            </button>
          </header>

          <div className={`connection-status ${wsConnectionStatus}`}>
            <span className="status-dot" />
            <span>{WsConnectionStatusLabels[wsConnectionStatus]}</span>
            {wsConnectionStatus === "disconnected" && (
              <>
                <span className="status-hint">Revisa tu conexión</span>
                <button className="retry-button" onClick={retryConnection}>
                  Reintentar
                </button>
              </>
            )}
          </div>

          <div className="connect-section">
            <button
              className="section-toggle"
              onClick={() => setShowQr(!showQr)}
              aria-expanded={showQr}
            >
              <span>
                <strong>Conectar dispositivo</strong>
                <small>Usa el celular para compartir una orden</small>
              </span>
              <span className="chevron">{showQr ? "⌃" : "⌄"}</span>
            </button>
            {showQr && (
              <div className="qr-content">
                <canvas ref={qrCodeRefCallback} />
                <div>
                  <p>Escanea este código QR con tu celular</p>
                  <a
                    href={SIGOPER_COMPANION_URL}
                    target="_blank"
                    rel="noopener"
                  >
                    {SIGOPER_COMPANION_URL}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="order-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">ÚLTIMA RECEPCIÓN</p>
                <h2>Orden de despacho</h2>
              </div>
              {ordenDespacho && receivedAt && (
                <span className="received-badge">
                  <strong>Recibida</strong>
                  <time dateTime={receivedAt.toISOString()}>
                    {formatDateTime(receivedAt)}
                  </time>
                </span>
              )}
            </div>

            {ordenDespacho ? (
              <div className="order-card">
                <div className="order-number">
                  <span>Orden</span>
                  <strong>#{ordenDespacho.despacho.numero}</strong>
                </div>
                <div className="detail-grid">
                  <div className="detail-item wide">
                    <span>Producto</span>
                    <strong>{ordenDespacho.despacho.producto || "—"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Cantidad</span>
                    <strong>
                      {ordenDespacho.despacho.cantidad}{" "}
                      {ordenDespacho.despacho.unidad_cantidad}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Despacho programado</span>
                    <strong>
                      {formatDate(
                        ordenDespacho.despacho.fecha_despacho_programado,
                      )}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Despacho efectivo</span>
                    <strong>
                      {formatDate(
                        ordenDespacho.despacho.fecha_despacho_efectivo,
                      )}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Planta de despacho</span>
                    <strong>
                      {ordenDespacho.despacho.planta_despacho || "—"}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Conductor</span>
                    <strong>{ordenDespacho.despacho.conductor || "—"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Licencia</span>
                    <strong>{ordenDespacho.despacho.licencia || "—"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Placa</span>
                    <strong>{ordenDespacho.despacho.placa || "—"}</strong>
                  </div>
                  <div className="detail-item wide">
                    <span>Factura</span>
                    <strong>
                      {ordenDespacho.facturacion.numero_factura || "—"}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Estado de factura</span>
                    <strong>
                      {ordenDespacho.facturacion.estado_factura || "—"}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>CUF</span>
                    <strong>{ordenDespacho.facturacion.cuf || "—"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Fecha de emisión</span>
                    <strong>
                      {formatDate(ordenDespacho.facturacion.fecha_emision)}
                    </strong>
                  </div>
                  <div className="detail-item wide">
                    <span>Razón social</span>
                    <strong>
                      {ordenDespacho.facturacion.nombre_razon_social || "—"}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Tipo de documento</span>
                    <strong>
                      {ordenDespacho.facturacion.tipo_documento || "—"}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>Número de documento</span>
                    <strong>
                      {ordenDespacho.facturacion.numero_documento || "—"}
                    </strong>
                  </div>
                  <div className="detail-item wide">
                    <span>Código SIREHIDRO</span>
                    <strong>
                      {ordenDespacho.facturacion.codigo_sirehidro || "—"}
                    </strong>
                  </div>
                </div>
                <button className="primary-button">
                  Rellenar campos <span>→</span>
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">⌁</span>
                <div>
                  <strong>Esperando una orden</strong>
                  <p>
                    La orden de despacho aparecerá aquí cuando sea recibida.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      <button
        className={`toggle-button ${show ? "is-open" : ""}`}
        onClick={() => setShow(!show)}
        aria-label={
          show ? "Cerrar SIGOPER Companion" : "Abrir SIGOPER Companion"
        }
        aria-expanded={show}
      >
        <img src={Logo} alt="SIGOPER Companion" className="button-icon" />
      </button>
    </div>
  );
}

export default App;
