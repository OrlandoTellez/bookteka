import { Pressable, View, StyleSheet } from "react-native"
import { Grid, Menu } from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"
import { FilterBook, type FilterStatus, type SortBy } from "./FilterBook"

export type ViewMode = "grid" | "list"
export type { FilterStatus, SortBy }

interface LibraryToolbarProps {
  filterStatus: FilterStatus
  onFilterChange: (status: FilterStatus) => void
  sortBy: SortBy
  onSortChange: (sort: SortBy) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function LibraryToolbar({
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: LibraryToolbarProps) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.filterSortRow}>
        <FilterBook filterStatus={filterStatus} onFilterChange={onFilterChange} sortBy={sortBy} onSortChange={onSortChange} />
      </View>
      <View style={styles.viewToggle}>
        <Pressable
          onPress={() => onViewModeChange("grid")}
          style={[styles.viewButton, styles.viewButtonFirst, viewMode === "grid" && styles.viewButtonActive]}
        >
          <Grid size={16} color={viewMode === "grid" ? THEME.colors.secondaryColor : THEME.colors.fontColorText} />
        </Pressable>
        <Pressable
          onPress={() => onViewModeChange("list")}
          style={[styles.viewButton, styles.viewButtonLast, viewMode === "list" && styles.viewButtonActive]}
        >
          <Menu size={16} color={viewMode === "list" ? THEME.colors.secondaryColor : THEME.colors.fontColorText} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 16,
    paddingBottom: 12, gap: 8,
  },
  filterSortRow: { flex: 1, flexShrink: 1 },
  viewToggle: {
    flexDirection: "row",
    borderWidth: 1, borderColor: THEME.colors.borderColor,
    borderRadius: 5, overflow: "hidden",
  },
  viewButton: {
    paddingVertical: 8, paddingHorizontal: 10,
    backgroundColor: THEME.colors.fourColor,
  },
  viewButtonFirst: { borderRightWidth: 0.5, borderRightColor: THEME.colors.borderColor },
  viewButtonLast: { borderLeftWidth: 0.5, borderLeftColor: THEME.colors.borderColor },
  viewButtonActive: { backgroundColor: THEME.colors.thirdColor },
})
