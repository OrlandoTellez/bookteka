import { TextInput, View, StyleSheet } from "react-native"
import { Search } from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"

interface LibrarySearchBarProps {
  value: string
  onChangeText: (text: string) => void
}

export function LibrarySearchBar({ value, onChangeText }: LibrarySearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search size={18} color={THEME.colors.fontColorText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar libros..."
          placeholderTextColor={THEME.colors.fontColorText}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  searchContainer: { paddingHorizontal: 16, paddingBottom: 10 },
  searchBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: THEME.colors.fourColor, borderRadius: 5,
    paddingHorizontal: 14, gap: 10,
    borderWidth: 1, borderColor: THEME.colors.borderColor,
  },
  searchInput: {
    flex: 1, paddingVertical: 12, fontSize: 16, color: THEME.colors.fontColorTitle,
  },
})
