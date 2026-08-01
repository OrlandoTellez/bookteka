import { ActivityIndicator, Text, View, StyleSheet } from "react-native"
import { User } from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"

interface ProfileHeaderProps {
  isLoading: boolean
}

export function ProfileHeader({ isLoading }: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.avatarSmall}>
          {isLoading ? (
            <ActivityIndicator size="small" color={THEME.colors.fontColorText} />
          ) : (
            <User size={20} color={THEME.colors.secondaryColor} />
          )}
        </View>
        <View>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <Text style={styles.headerSubtitle}>Estadísticas de lectura</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { paddingBottom: 4 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: THEME.colors.thirdColor,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: THEME.colors.fontColorTitle,
  },
  headerSubtitle: {
    fontSize: 13,
    color: THEME.colors.fontColorText,
    marginTop: 1,
  },
})
