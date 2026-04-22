type MessageHandler = (data: WSMessage) => void;
type StatusHandler = (event: string, detail: string) => void;

export interface WSMessage {
  type: string;
  room: string;
  payload: unknown;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private room: string = "";
  private url: string = "";

  connect(room: string) {
    this.room = room;
    // Use NEXT_PUBLIC_WS_URL if set (backend ws directly), otherwise fallback to proxy via frontend
    const wsBase = (process.env.NEXT_PUBLIC_WS_URL || "").replace(/\/$/, "");
    if (wsBase) {
      this.url = `${wsBase}/ws/${room}`;
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      this.url = `${protocol}//${window.location.host}/ws/${room}`;
    }
    this.emitStatus("connecting", `URL: ${this.url}`);
    this.doConnect();
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private emitStatus(event: string, detail: string) {
    this.statusHandlers.forEach((h) => h(event, detail));
  }

  private doConnect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log(`[WS] Connected to room ${this.room}`);
      this.emitStatus("connected", `Room ${this.room} @ ${this.url}`);
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        this.emitStatus("message", `type=${msg.type} room=${msg.room}`);
        const typeHandlers = this.handlers.get(msg.type);
        if (typeHandlers) {
          typeHandlers.forEach((handler) => handler(msg));
        }
        // Also notify wildcard handlers
        const wildcardHandlers = this.handlers.get("*");
        if (wildcardHandlers) {
          wildcardHandlers.forEach((handler) => handler(msg));
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
        this.emitStatus("error", `Parse error: ${err}`);
      }
    };

    this.ws.onclose = (e) => {
      console.log("[WS] Disconnected, reconnecting in 3s...");
      this.emitStatus("disconnected", `code=${e.code} reason=${e.reason || "none"}`);
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      this.emitStatus("error", `WebSocket error (lihat console untuk detail)`);
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.doConnect();
    }, 3000);
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
  }
}

export const wsManager = new WebSocketManager();
