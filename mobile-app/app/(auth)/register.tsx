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
import { signUp } from "@/shared/lib/auth"
import { useAppTheme } from "@/hooks/useAppTheme"
import type { ThemeTokens } from "@/shared/theme"

export default function RegisterScreen() {
  const router = useRouter()
  const { theme } = useAppTheme()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Por favor completa todos los campos")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await signUp(name.trim(), email.trim(), password)
      // Navigate to login on success
      router.replace("/(auth)/login")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al registrar"
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
          <Text style={styles.subtitle}>Crea tu cuenta gratuita</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor={theme.fontColorText}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

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
                placeholder="Mínimo 6 caracteres"
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Repetir Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Repite tu contraseña"
                placeholderTextColor={theme.fontColorText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.6}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={theme.fontColorText} />
                ) : (
                  <Eye size={20} color={theme.fontColorText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Inicia sesión</Text>
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
      borderRadius: 5,
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
      borderRadius: 5,
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
      borderRadius: 5,
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
      borderRadius: 5,
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
