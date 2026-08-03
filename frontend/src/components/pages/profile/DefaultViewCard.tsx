import { LayoutGrid } from "lucide-react";
import type { LibraryView } from "@/types/reading";
import styles from "./DefaultViewCard.module.css";

const VIEWS: { value: LibraryView; label: string }[] = [
  { value: "shelf", label: "Estante" },
  { value: "grid", label: "Cuadrícula" },
  { value: "list", label: "Lista" },
];

interface DefaultViewCardProps {
  view: LibraryView;
  onChange: (view: LibraryView) => void;
}

export const DefaultViewCard = ({ view, onChange }: DefaultViewCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>
          <LayoutGrid size={20} color="var(--font-color-title)" />
          <h3>Vista de la biblioteca</h3>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Vista por defecto</label>
        <select
          value={view}
          onChange={(e) => onChange(e.target.value as LibraryView)}
          className={styles.select}
        >
          {VIEWS.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <p className={styles.hint}>
        Esta será la vista que se muestre al abrir tu biblioteca.
      </p>
    </div>
  );
};