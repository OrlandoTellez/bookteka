import { useState, useEffect, useCallback, useMemo } from "react"
import { ScrollView, Alert, StyleSheet } from "react-native"
import { Clock, BookOpen, TrendingUp } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { THEME } from "@/shared/lib/theme"
import { router } from "expo-router"
import { CloudSyncToggle } from "@/components/common/CloudSyncToggle"
import { useBookStore } from "@/shared/store/bookStore"
import { getSession, signOut, type SessionData } from "@/shared/lib/auth"
import { clearDatabase } from "@/shared/database"
import { downloadBookUrl } from "@/shared/api/book"
import { formatTime } from "@/utils/time"
import { StreakCard } from "@/features/profile/components/StreakCard"
import { ReadingSettingsCard } from "@/features/profile/components/ReadingSettingsCard"
import { ProfileHeader } from "@/features/profile/components/ProfileHeader"
import { UserCard } from "@/features/profile/components/UserCard"
import { StatsGrid, type StatItem } from "@/features/profile/components/StatsGrid"
import { BookProgressList } from "@/features/profile/components/BookProgressList"
import { SignOutButton } from "@/features/profile/components/SignOutButton"
import type { Book } from "@/shared/types/book"

export default function ProfileScreen() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const { books, loadBooks, uploadBookToCloud } = useBookStore()
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const sessionData = await getSession()
        setSession(sessionData)
      } catch (err) {
        console.error("Error loading session:", err)
      } finally {
        setIsSessionLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => { loadBooks() }, [loadBooks])

  const totalReadingTime = useMemo(
    () => books.reduce((acc, b) => acc + (b.readingTimeSeconds || 0), 0),
    [books],
  )
  const totalBooks = books.length
  const booksStarted = books.filter((b) => (b.scrollPosition ?? 0) > 0).length
  const averageTimePerBook = totalBooks > 0 ? Math.round(totalReadingTime / totalBooks) : 0

  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => (b.readingTimeSeconds ?? 0) - (a.readingTimeSeconds ?? 0)),
    [books],
  )

  const handleSignOut = useCallback(() => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión", style: "destructive",
        onPress: async () => {
          setIsSigningOut(true)
          try {
            await signOut()
            await clearDatabase()
            router.replace("/(auth)/login")
          } catch (error) {
            console.error("Error al cerrar sesión:", error)
            setIsSigningOut(false)
          }
        },
      },
    ])
  }, [router])

  const handleDownload = useCallback(async (bookId: string) => {
    try {
      await downloadBookUrl(bookId)
      // En mobile no podemos forzar descarga como en web, abrimos en webview o mostramos URL
      Alert.alert("Descarga", `URL del archivo generada. Puedes abrirla desde un navegador.`)
    } catch (error) {
      Alert.alert("Error", "No se pudo descargar el archivo.")
    }
  }, [])

  const handleUploadToCloud = useCallback(async (bookId: string) => {
    try {
      await uploadBookToCloud(bookId)
      await loadBooks()
      Alert.alert("Sincronizado", "El libro se ha subido a la nube correctamente.")
    } catch (error) {
      Alert.alert("Error", "No se pudo subir el libro. Verifica tu conexión.")
    }
  }, [uploadBookToCloud, loadBooks])

  const handleEditTime = useCallback((book: Book) => {
    Alert.alert(
      "Editar tiempo de lectura",
      `"${book.name.replace(".pdf", "")}"\n\nTiempo actual: ${formatTime(book.readingTimeSeconds ?? 0)}\n\nPara editar el tiempo, puedes reiniciar el progreso del libro desde la pantalla de lectura.`,
    )
  }, [])

  const stats: StatItem[] = [
    {
      icon: Clock,
      iconColor: THEME.colors.secondaryColor,
      label: "Tiempo total",
      value: formatTime(totalReadingTime),
    },
    {
      icon: BookOpen,
      iconColor: "#4ade80",
      label: "Libros",
      value: totalBooks.toString(),
    },
    {
      icon: TrendingUp,
      iconColor: "#5ea2f5",
      label: "En progreso",
      value: booksStarted.toString(),
    },
    {
      icon: Clock,
      iconColor: "#d6a422",
      label: "Promedio/libro",
      value: formatTime(averageTimePerBook),
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader isLoading={isSessionLoading} />

        {/* Cloud Sync Toggle */}
        <CloudSyncToggle />

        {/* Streak Card */}
        <StreakCard />

        {/* User Info */}
        <UserCard session={session} isLoading={isSessionLoading} />

        {/* Reading Settings */}
        <ReadingSettingsCard />

        {/* Stats Grid */}
        <StatsGrid items={stats} />

        {/* Books List */}
        <BookProgressList
          books={sortedBooks}
          onDownload={handleDownload}
          onUploadToCloud={handleUploadToCloud}
          onEditTime={handleEditTime}
        />

        {/* Sign Out */}
        <SignOutButton isSigningOut={isSigningOut} onPress={handleSignOut} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.primaryColor,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.primaryColor,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    paddingBottom: 40,
    gap: 16,
  },
})
