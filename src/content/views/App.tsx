import Logo from "@/assets/icons/icon48.png";
import { useEffect, useState } from "react";
import "./App.css";
import QRCode from "qrcode";
import { OrdenDespacho as OrdenDespachoType } from "@/models/orden-despacho";
import { formatDateTime } from "@/utils";
import OrdenDespacho from "@/components/OrdenDespacho";

const logoUrl = chrome.runtime.getURL(Logo);
const room_id = self.crypto.randomUUID();
const SIGOPER_COMPANION_URL = `${import.meta.env.VITE_SIGOPER_COMPANION_URL}/${room_id}`;
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

function App() {
  const [show, setShow] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [ordenDespacho, setOrdenDespacho] = useState<OrdenDespachoType | null>(
    null,
  );
  const [receivedAt, setReceivedAt] = useState<Date | null>(null);
  const [wsConnectionStatus, setWsConnectionStatus] =
    useState<WsConnectionStatus>("connecting");
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  useEffect(() => {
    setWsConnectionStatus("connecting");
    const ws = new WebSocket(
      `${import.meta.env.VITE_SIGOPER_COMPANION_WS_URL}/${room_id}`,
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
              <img src={logoUrl} alt="" className="panel-logo" />
              <div>
                <p className="eyebrow no-margin">SIGOPER</p>
                <h1 className="no-margin">Companion</h1>
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
                  <p className="no-margin">
                    Escanea este código QR con tu celular
                  </p>
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
                <p className="eyebrow no-margin">ÚLTIMA RECEPCIÓN</p>
                <h2 className="no-margin">Orden de despacho</h2>
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

            <OrdenDespacho ordenDespacho={ordenDespacho} />
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
        <img src={logoUrl} alt="SIGOPER Companion" className="button-icon" />
      </button>
    </div>
  );
}

export default App;
