import { Redirect, Tabs } from "expo-router"
import { Book, User } from "lucide-react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useEffect, useState } from "react"
import { getCachedSession } from "@/shared/lib/auth"
import { setCurrentUserId } from "@/shared/database"
import { ActivityIndicator, View } from "react-native"

type TabRoutes = "index" | "profile"

interface TabConfig {
  name: TabRoutes
  title: string
  icon: typeof Book
}

const TABS: TabConfig[] = [
  { name: "index", title: "Librería", icon: Book },
  { name: "profile", title: "Perfil", icon: User },
]

export default function TabLayout() {
  const { theme } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [isChecking, setIsChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const session = await getCachedSession()
        if (session?.user?.id) {
          setCurrentUserId(session.user.id)
          setHasSession(true)
        } else {
          setHasSession(false)
        }
      } catch {
        setHasSession(false)
      } finally {
        setIsChecking(false)
      }
    }
    check()
  }, [])

  // Show loading while checking session
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

  // Not authenticated → redirect to login
  if (!hasSession) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.primary,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 70 + insets.bottom,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          flex: 1,
        },
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
        },
        tabBarActiveTintColor: theme.secondary,
        tabBarInactiveTintColor: theme.fontColorText,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <tab.icon color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}
