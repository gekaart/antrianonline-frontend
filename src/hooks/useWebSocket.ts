"use client";

import { useEffect, useRef, useCallback } from "react";
import { wsManager, type WSMessage } from "@/lib/ws";

export function useWebSocket(
  roomId: string | null,
  messageType: string,
  handler: (payload: unknown) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const stableHandler = useCallback((msg: WSMessage) => {
    handlerRef.current(msg.payload);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    wsManager.connect(roomId);
    wsManager.on(messageType, stableHandler);

    return () => {
      wsManager.off(messageType, stableHandler);
    };
  }, [roomId, messageType, stableHandler]);
}
