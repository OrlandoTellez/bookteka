import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { useRouter, Link } from "expo-router"
import { Book, Eye, EyeOff } from "lucide-react-native"
import { signIn } from "@/shared/lib/auth"
import { useAppTheme } from "@/hooks/useAppTheme"
import type { ThemeTokens } from "@/shared/theme"

export default function LoginScreen() {
  const router = useRouter()
  const { theme } = useAppTheme()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await signIn(email.trim(), password)
      router.replace("/(tabs)")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al iniciar sesión"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const styles = makeStyles(theme)

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Book size={48} color="#ffffff" style={styles.logo} />
          <Text style={styles.title}>Bookteka</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@ejemplo.com"
              placeholderTextColor={theme.fontColorText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Tu contraseña"
                placeholderTextColor={theme.fontColorText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.6}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.fontColorText} />
                ) : (
                  <Eye size={20} color={theme.fontColorText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function makeStyles(theme: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primary,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 48,
    },
    header: {
      alignItems: "center",
      marginBottom: 40,
    },
    logo: {
      marginBottom: 12,
    },
    title: {
      fontSize: 36,
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.fontColorText,
    },
    errorContainer: {
      backgroundColor: theme.third,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: "#ef4444",
    },
    errorText: {
      color: "#ef4444",
      fontSize: 14,
    },
    form: {
      gap: 16,
    },
    inputGroup: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.fontColorTitle,
      marginLeft: 4,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.fontColorTitle,
      borderWidth: 1,
      borderColor: theme.border,
    },
    passwordContainer: {
      position: "relative",
      justifyContent: "center",
    },
    passwordInput: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      paddingRight: 48,
      fontSize: 16,
      color: theme.fontColorTitle,
      borderWidth: 1,
      borderColor: theme.border,
    },
    eyeButton: {
      position: "absolute",
      right: 14,
      padding: 4,
    },
    button: {
      backgroundColor: theme.secondary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      minHeight: 52,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 32,
    },
    footerText: {
      color: theme.fontColorText,
      fontSize: 14,
    },
    footerLink: {
      color: theme.secondary,
      fontSize: 14,
      fontWeight: "600",
    },
  })
}
