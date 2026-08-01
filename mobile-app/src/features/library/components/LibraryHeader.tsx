import { Text, View, StyleSheet } from "react-native"
import { THEME } from "@/shared/lib/theme"

interface LibraryHeaderProps {
  bookCount: number
}

export function LibraryHeader({ bookCount }: LibraryHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Librería</Text>
      <Text style={styles.subtitle}>
        {bookCount > 0
          ? `${bookCount} libro${bookCount !== 1 ? "s" : ""} en tu biblioteca`
          : "Tu biblioteca personal"}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 32, fontWeight: "700", color: THEME.colors.fontColorTitle },
  subtitle: { fontSize: 15, color: THEME.colors.fontColorText, marginTop: 4 },
})
