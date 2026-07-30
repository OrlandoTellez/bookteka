import { Stack, Redirect } from "expo-router"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useEffect, useState } from "react"
import { getCachedSession } from "@/shared/lib/auth"
import { hasCompletedOnboarding } from "@/shared/lib/onboarding"
import { ActivityIndicator, View } from "react-native"

type AuthRoutes = "login" | "register"

interface AuthConfig {
  name: AuthRoutes
  title?: string
  presentation?: "modal" | "card" | "fullScreenModal"
  headerShown: boolean
}

const AUTH_ROUTES: AuthConfig[] = [
  {
    name: "login",
    title: "Iniciar Sesión",
    headerShown: false,
  },
  {
    name: "register",
    title: "Crear Cuenta",
    headerShown: false,
  },
]

export default function AuthLayout() {
  const { theme } = useAppTheme()
  const [isChecking, setIsChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(true)

  useEffect(() => {
    async function check() {
      try {
        const [session, onboardingCompleted] = await Promise.all([
          getCachedSession(),
          hasCompletedOnboarding(),
        ])
        setHasSession(!!session)
        setOnboardingDone(onboardingCompleted)
      } catch {
        setHasSession(false)
        setOnboardingDone(true)
      } finally {
        setIsChecking(false)
      }
    }
    check()
  }, [])

  // Show loading while checking
  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.primary,
        }}
      >
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    )
  }

  // Already authenticated → redirect to tabs
  if (hasSession) {
    return <Redirect href="/(tabs)" />
  }

  // Not authenticated AND onboarding not completed → redirect to onboarding
  if (!onboardingDone) {
    return <Redirect href="/(onboarding)/welcome" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: theme.fontColorTitle,
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: theme.primary },
      }}
    >
      {AUTH_ROUTES.map((route) => (
        <Stack.Screen
          key={route.name}
          name={route.name}
          options={{
            title: route.title,
            presentation: route.presentation,
          }}
        />
      ))}
    </Stack>
  )
}
