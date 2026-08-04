import { BookIcon, Plus } from "lucide-react"
import styles from "./NoBooks.module.css"

interface NoBooksProps {
  setShowUploader: () => void
}

export const NoBooks = ({ setShowUploader }: NoBooksProps) => {
  return (
    <>
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <BookIcon width={64} height={64} color="var(--font-color-text)" />
        </div>
        <h2 className={styles.emptyTitle}>Tu biblioteca está vacía</h2>
        <p className={styles.emptyText}>
          Sube tu primer libro para comenzar a leer
        </p>
        <button
          className={styles.emptyButton}
          onClick={setShowUploader}
        >
          <Plus width={20} height={20} />
          Añadir tu primer libro
        </button>
      </div>

    </>
  )
}

