import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiJson } from "../api/client";

const TimerContext = createContext(null);
const SYNC_INTERVAL = 15000;

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TimerProvider({ children }) {
  const [timer, setTimer] = useState(null);
  const [display, setDisplay] = useState(0);
  const [loading, setLoading] = useState(true);
  const tickRef = useRef(null);
  const syncRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await apiJson("/timer/ativo");
      setTimer(data);
      setDisplay(data?.elapsed_seconds ?? 0);
    } catch {
      setTimer(null);
      setDisplay(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    clearInterval(tickRef.current);
    if (timer?.status === "running") {
      const base = timer.elapsed_seconds ?? 0;
      const startedAt = Date.now();
      tickRef.current = setInterval(() => {
        const extra = Math.floor((Date.now() - startedAt) / 1000);
        setDisplay(base + extra);
      }, 1000);
    } else {
      setDisplay(timer?.elapsed_seconds ?? 0);
    }
    return () => clearInterval(tickRef.current);
  }, [timer]);

  useEffect(() => {
    clearInterval(syncRef.current);
    if (timer) {
      syncRef.current = setInterval(async () => {
        try {
          const { data } = await apiJson("/timer/sync", {
            method: "POST",
            body: JSON.stringify({ elapsed_seconds: display }),
          });
          if (data) setTimer(data);
        } catch { /* ignore */ }
      }, SYNC_INTERVAL);
    }
    return () => clearInterval(syncRef.current);
  }, [timer, display]);

  const start = useCallback(async (demandaId) => {
    const { data } = await apiJson("/timer/start", {
      method: "POST",
      body: JSON.stringify({ demanda_id: demandaId }),
    });
    setTimer(data);
    setDisplay(data?.elapsed_seconds ?? 0);
    return data;
  }, []);

  const pause = useCallback(async () => {
    const { data } = await apiJson("/timer/pause", { method: "POST" });
    setTimer(data);
    setDisplay(data?.elapsed_seconds ?? 0);
  }, []);

  const resume = useCallback(async () => {
    const { data } = await apiJson("/timer/resume", { method: "POST" });
    setTimer(data);
    setDisplay(data?.elapsed_seconds ?? 0);
  }, []);

  const stop = useCallback(async (comentario) => {
    await apiJson("/timer/stop", {
      method: "POST",
      body: JSON.stringify({ comentario }),
    });
    setTimer(null);
    setDisplay(0);
  }, []);

  const value = useMemo(
    () => ({
      timer,
      display,
      formatted: formatElapsed(display),
      loading,
      isRunning: timer?.status === "running",
      isPaused: timer?.status === "paused",
      start,
      pause,
      resume,
      stop,
      reload: load,
    }),
    [timer, display, loading, start, pause, resume, stop, load]
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer deve ser usado dentro de TimerProvider");
  return ctx;
}
