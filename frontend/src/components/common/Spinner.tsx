import styles from "./Spinner.module.css";

interface SpinnerProps {
  /** Diámetro del spinner en píxeles. Por defecto 40. */
  size?: number;
}

export const Spinner = ({ size = 40 }: SpinnerProps) => {
  return (
    <div className={styles.content}>
      <div
        className={styles.spinner}
        style={{
          width: size,
          height: size,
          borderWidth: Math.max(2, Math.round(size / 10)),
        }}
      />
    </div>
  );
};
