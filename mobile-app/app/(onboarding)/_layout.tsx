import { Stack, Redirect } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { hasCompletedOnboarding } from "@/shared/lib/onboarding"
import { getCachedSession } from "@/shared/lib/auth"
import { useAppTheme } from "@/hooks/useAppTheme"

type OnboardingLayoutRoutes = "welcome"

interface OnBoardingConfig {
  name: OnboardingLayoutRoutes
  title: string
}

const ON_BOARDING_ROUTES: OnBoardingConfig[] = [
  {
    name: "welcome",
    title: "Welcome",
  },
]

export default function OnboardingLayout() {
  const { theme } = useAppTheme()
  const [isChecking, setIsChecking] = useState(true)
  const [redirect, setRedirect] = useState<"/(tabs)" | "/(auth)/login" | null>(null)

  useEffect(() => {
    async function check() {
      try {
        const completed = await hasCompletedOnboarding()
        if (completed) {
          const session = await getCachedSession()
          setRedirect(session ? "/(tabs)" : "/(auth)/login")
        } else {
          // User hasn't completed onboarding, show it
          setIsChecking(false)
        }
      } catch {
        setIsChecking(false)
      }
    }
    check()
  }, [])

  if (redirect) {
    return <Redirect href={redirect} />
  }

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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.primary },
        animation: "slide_from_right",
      }}
    >
      {ON_BOARDING_ROUTES.map((routes) => (
        <Stack.Screen
          key={routes.name}
          name={routes.name}
          options={{
            title: routes.title,
          }}
        />
      ))}
    </Stack>
  )
}

