import { useState } from "react";
import { useTimer } from "../../context/TimerContext";
import { Button } from "../ui/Button";

export default function TimerWidget() {
  const { timer, formatted, isRunning, isPaused, pause, resume, stop } = useTimer();
  const [stopping, setStopping] = useState(false);

  if (!timer) return null;

  const handleStop = async () => {
    setStopping(true);
    try {
      await stop("Encerrado pelo widget");
    } finally {
      setStopping(false);
    }
  };

  return (
    <div className="timer-widget">
      <div className="timer-widget__ring">
        <span className="timer-widget__time">{formatted}</span>
        <small>{timer.demanda_codigo}</small>
      </div>
      <div className="timer-widget__actions">
        {isRunning && <Button size="sm" variant="ghost" onClick={pause}>Pausar</Button>}
        {isPaused && <Button size="sm" variant="primary" onClick={resume}>Continuar</Button>}
        <Button size="sm" variant="danger" onClick={handleStop} loading={stopping}>Encerrar</Button>
      </div>
    </div>
  );
}
