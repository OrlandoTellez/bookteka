import { ActivityIndicator, Pressable, Text, StyleSheet } from "react-native"
import { LogOut } from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"

interface SignOutButtonProps {
  isSigningOut: boolean
  onPress: () => void
}

export function SignOutButton({ isSigningOut, onPress }: SignOutButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.signOutButton,
        pressed && styles.signOutButtonPressed,
        isSigningOut && styles.signOutButtonDisabled,
      ]}
      onPress={onPress}
      disabled={isSigningOut}
    >
      {isSigningOut ? (
        <ActivityIndicator color="#ef4444" size="small" />
      ) : (
        <>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: THEME.colors.cardColor,
    borderRadius: 5,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ef4444",
    minHeight: 52,
  },
  signOutButtonPressed: {
    opacity: 0.85
  },
  signOutButtonDisabled: {
    opacity: 0.5
  },
  signOutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600"
  },
})
