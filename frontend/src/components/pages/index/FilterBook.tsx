import { ChevronDown, Search } from "lucide-react";
import styles from "./FilterBook.module.css"

type FilterStatus = "all" | "reading" | "unstarted";

interface FilterBookProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  isFilterOpen: boolean
  setIsFilterOpen: () => void
  filterStatus: FilterStatus
  setFilterStatus: (key: FilterStatus) => void
  filterLabels: Record<FilterStatus, string>
}

export const FilterBook = ({
  searchQuery,
  setSearchQuery,
  isFilterOpen,
  setIsFilterOpen,
  filterStatus,
  setFilterStatus,
  filterLabels,
}: FilterBookProps) => {
  return (
    <>
      <div className={styles.filters}>
        {/* Search */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchIcon}>
            <Search width={16} />
          </div>
          <input
            type="text"
            placeholder="Buscar libros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={`dropdown-filter ${styles.dropdown}`}>
          <button
            className={styles.dropdownTrigger}
            onClick={setIsFilterOpen}
            aria-expanded={isFilterOpen}
          >
            {filterLabels[filterStatus]}

            <ChevronDown width={16}
              className={`${styles.chevron} ${isFilterOpen ? styles.chevronOpen : ""}`}
            />
          </button>
          <div
            className={`${styles.dropdownContent} ${isFilterOpen ? styles.open : ""
              }`}
          >
            {(Object.keys(filterLabels) as FilterStatus[]).map((key) => (
              <button
                key={key}
                className={styles.dropdownItem}
                onClick={() => {
                  setFilterStatus(key);
                  setIsFilterOpen();
                }}
              >
                {filterLabels[key]}
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}

