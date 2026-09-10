import Logo from "@/assets/crx.svg";
import { useEffect, useState } from "react";
import "./App.css";
import QRCode from "qrcode";
import { MessageData } from "@/models/message-data";
import { OrdenDespacho } from "@/models/orden-despacho";

const room_id = 1;
const SIGOPER_COMPANION_URL = `https://sigoper-companion-service.local/${room_id}`;
type WsConnectionStatus = "connected" | "disconnected" | "connecting";

const WsConnectionStatusLabels = {
  connected: "Conectado",
  disconnected: "Desconectado",
  connecting: "Conectando...",
};

const qrCodeRefCallback = (canvas: HTMLCanvasElement) => {
  void QRCode.toCanvas(canvas, SIGOPER_COMPANION_URL, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 240,
  });
};

function App() {
  const [show, setShow] = useState(false);
  const toggle = () => setShow(!show);
  const [showQr, setShowQr] = useState(true);
  const toggleQr = () => setShowQr(!showQr);
  const [ordenDespacho, setOrdenDespacho] =
    useState<MessageData<OrdenDespacho> | null>(null);
  const [wsConnectionStatus, setWsConnectionStatus] =
    useState<WsConnectionStatus>("connecting");

  useEffect(() => {
    const ws = new WebSocket(
      `wss://sigoper-companion-service.localhost/ws/${room_id}`,
    );
    ws.onopen = () => {
      setWsConnectionStatus("connected");
    };
    ws.onclose = () => {
      setWsConnectionStatus("disconnected");
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setOrdenDespacho(data);
      } catch {
        setOrdenDespacho(null);
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="popup-container">
      {show && (
        <div className={`popup-content ${show ? "opacity-100" : "opacity-0"}`}>
          <p>{WsConnectionStatusLabels[wsConnectionStatus]}</p>
          {showQr && (
            <>
              <p>Escanea el QR con tu celular</p>
              <canvas ref={qrCodeRefCallback} />
              <p>{SIGOPER_COMPANION_URL}</p>
            </>
          )}
          <button onClick={toggleQr}>
            {showQr ? "Ocultar QR" : "Mostrar QR"}
          </button>
          <p>Orden de despacho</p>
          {ordenDespacho ? (
            <>
              <pre>{JSON.stringify(ordenDespacho, null, 2)}</pre>
              <button>Rellenar campos</button>
            </>
          ) : (
            <p>Aqui se mostrarán los datos de la orden de despacho.</p>
          )}
        </div>
      )}
      <button className="toggle-button" onClick={toggle}>
        <img src={Logo} alt="CRXJS logo" className="button-icon" />
      </button>
    </div>
  );
}

export default App;
