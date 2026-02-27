import styles from "./StreakCard.module.css";
import { useState } from "react";
import { Flame, Settings, Check } from "lucide-react";

export const StreakCard = ({
  streakData,
  onCompleteDay,
  onInitializeStreak,
  isLoading,
}: any) => {
  const [showSettings, setShowSettings] = useState(false);
  const [days, setDays] = useState("14");
  const [date, setDate] = useState("");

  const handleCompleteDay = async () => {
    if (!onCompleteDay) return;
    const success = await onCompleteDay();
    if (success) alert("¡Racha completada!");
    else alert("Ya completaste hoy");
  };

  const handleInit = async () => {
    if (!onInitializeStreak) return;
    const d = parseInt(days, 10);
    if (isNaN(d) || d < 1) {
      alert("Número inválido");
      return;
    }
    await onInitializeStreak(d, date || undefined);
    setShowSettings(false);
  };

  const formatDate = (str: string | null) => {
    if (!str) return "No iniciada";
    return new Date(str).toLocaleDateString();
  };

  return (
    <div className={styles.streakCard}>
      <div className={styles.streakLeft}>
        <div className={styles.flame}>
          <Flame size={28} color="var(--secondary-color)" />
        </div>
        <div>
          <div className={styles.streakNumber}>{streakData.currentStreak}</div>
          <div className={styles.streakText}>días de racha</div>
          <div className={styles.streakDate}>
            Inicio: {formatDate(streakData.startDate)}
          </div>
        </div>
      </div>

      <div className={styles.streakActions}>
        <button
          className={styles.primaryButton}
          disabled={isLoading || streakData.hasCompletedToday}
          onClick={handleCompleteDay}
        >
          {streakData.hasCompletedToday ? (
            <>
              <Check size={16} /> Completado
            </>
          ) : (
            <>
              <Flame size={16} /> Completar día
            </>
          )}
        </button>

        <button
          className={styles.iconButton}
          onClick={() => setShowSettings((v) => !v)}
        >
          <Settings size={16} />
        </button>

        {showSettings && (
          <div className={styles.popover}>
            <label>Días iniciales</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />

            <label>Fecha inicio</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button className={styles.primaryButton} onClick={handleInit}>
              Establecer racha
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
