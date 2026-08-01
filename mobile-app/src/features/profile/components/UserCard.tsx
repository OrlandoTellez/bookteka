import { ActivityIndicator, Text, View, StyleSheet } from "react-native"
import { User } from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"
import type { SessionData } from "@/shared/lib/auth"

interface UserCardProps {
  session: SessionData | null
  isLoading: boolean
}

export function UserCard({ session, isLoading }: UserCardProps) {
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || "U"

  return (
    <View style={styles.userCard}>
      <View style={styles.userRow}>
        {isLoading ? (
          <View style={styles.avatarPlaceholder}>
            <ActivityIndicator size="small" color={THEME.colors.fontColorText} />
          </View>
        ) : session?.user?.image ? (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{userInitial}</Text>
          </View>
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={24} color={THEME.colors.secondaryColor} />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {isLoading ? "Cargando..." : session?.user?.name || "Usuario"}
          </Text>
          <Text style={styles.userEmail}>{session?.user?.email || ""}</Text>
          {session?.user?.emailVerified ? (
            <Text style={styles.verifiedBadge}>✓ Email Verificado</Text>
          ) : session?.user?.email ? (
            <Text style={styles.unverifiedBadge}>⚠ Email sin verificar</Text>
          ) : null}
        </View>
      </View>
      {session?.session?.createdAt && (
        <Text style={styles.memberSince}>
          Miembro desde: {new Date(session.session.createdAt).toLocaleDateString("es-ES")}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: THEME.colors.cardColor, borderRadius: 5, padding: 16,
    borderWidth: 1, borderColor: THEME.colors.borderColor, gap: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 5,
    backgroundColor: THEME.colors.thirdColor,
    justifyContent: "center", alignItems: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.colors.secondaryColor,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.colors.fontColorTitle,
  },
  userEmail: {
    fontSize: 13,
    color: THEME.colors.fontColorText,
  },
  verifiedBadge: {
    fontSize: 12,
    color: "#4ade80",
    fontWeight: "600",
    marginTop: 2,
  },
  unverifiedBadge: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600",
    marginTop: 2,
  },
  memberSince: {
    fontSize: 12,
    color: THEME.colors.fontColorText,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: THEME.colors.borderColor,
  },
})
