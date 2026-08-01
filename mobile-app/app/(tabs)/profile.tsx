import { useState, useEffect, useCallback, useMemo } from "react"
import {
  View, Text, ScrollView, Pressable,
  ActivityIndicator, Alert, StyleSheet,
} from "react-native"
import {
  User, Clock, BookOpen, TrendingUp,
  Cloud, CloudOff, CloudUpload, CloudDownload,
  Edit2, LogOut,
} from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"
import { CloudSyncToggle } from "@/components/common/CloudSyncToggle"
import { useBookStore } from "@/shared/store/bookStore"
import { useStreakStore } from "@/shared/store/streakStore"
import { getSession, signOut } from "@/shared/lib/auth"
import { clearDatabase } from "@/shared/database"
import { downloadBookUrl } from "@/shared/api/book"
import { formatTime } from "@/utils/time"
import { StatCard } from "@/features/profile/components/StatCard"
import { StreakCard } from "@/features/profile/components/StreakCard"
import { ReadingSettingsCard } from "@/features/profile/components/ReadingSettingsCard"
import type { SessionData } from "@/shared/lib/auth"
import type { Book } from "@/shared/types/book"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ProfileScreen() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const {
    books, loadBooks, setReadingTime,
    uploadBookToCloud, downloadBookFromCloud,
  } = useBookStore()
  const { streakData } = useStreakStore()
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

  const handleDownload = useCallback(async (bookId: string, fileName: string) => {
    try {
      const url = await downloadBookUrl(bookId)
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

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || "U"

  const stats = [
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.avatarSmall}>
              {isSessionLoading ? (
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

        {/* Cloud Sync Toggle */}
        <CloudSyncToggle />

        {/* Streak Card */}
        <StreakCard />

        {/* CardProfile - User Info */}
        <View style={styles.userCard}>
          <View style={styles.userRow}>
            {isSessionLoading ? (
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
                {isSessionLoading ? "Cargando..." : session?.user?.name || "Usuario"}
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

        {/* Reading Settings */}
        <ReadingSettingsCard />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <StatCard
                key={index}
                icon={Icon}
                iconColor={stat.iconColor}
                label={stat.label}
                value={stat.value}
              />
            )
          })}
        </View>

        {/* Books List */}
        {sortedBooks.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color={THEME.colors.fontColorTitle} />
              <Text style={styles.sectionTitle}>Todos los libros</Text>
            </View>
            <View style={styles.bookList}>
              {sortedBooks.map((book, index) => (
                <View key={book.id} style={styles.bookRow}>
                  <Text style={styles.bookIndex}>{index + 1}</Text>

                  <View style={styles.bookInfo}>
                    <Text style={styles.bookName} numberOfLines={1}>
                      {book.name.replace(/\.pdf$/i, "")}
                    </Text>
                  </View>

                  <Text style={styles.bookTime}>
                    {formatTime(book.readingTimeSeconds ?? 0)}
                  </Text>

                  {/* Sync badge + Cloud actions */}
                  <View style={styles.cloudActions}>
                    <View style={styles.syncBadge}>
                      {book.isSynced ? (
                        <Cloud size={14} color={THEME.colors.secondaryColor} />
                      ) : (
                        <CloudOff size={14} color={THEME.colors.fontColorText} />
                      )}
                    </View>

                    <View style={styles.actionButtons}>
                      {book.isSynced ? (
                        <Pressable
                          onPress={() => handleDownload(book.id, book.name)}
                          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                          hitSlop={8}
                        >
                          <CloudDownload size={18} color={THEME.colors.secondaryColor} />
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => handleUploadToCloud(book.id)}
                          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                          hitSlop={8}
                        >
                          <CloudUpload size={18} color="#f97316" />
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Edit time button */}
                  <Pressable
                    onPress={() => handleEditTime(book)}
                    style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
                    hitSlop={8}
                  >
                    <Edit2 size={16} color={THEME.colors.fontColorTitle} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {sortedBooks.length === 0 && (
          <View style={styles.emptySection}>
            <BookOpen size={32} color={THEME.colors.fontColorText} />
            <Text style={styles.emptyText}>Aún no tienes libros. ¡Añade uno para empezar!</Text>
          </View>
        )}

        {/* Sign Out */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
            isSigningOut && styles.signOutButtonDisabled,
          ]}
          onPress={handleSignOut}
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
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.primaryColor
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.primaryColor,
    paddingHorizontal: 24,
    paddingTop: 16
  },
  contentContainer: {
    paddingBottom: 40,
    gap: 16
  },
  // Header
  header: {
    paddingBottom: 4
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
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
    color: THEME.colors.fontColorTitle
  },
  headerSubtitle: {
    fontSize: 13,
    color: THEME.colors.fontColorText,
    marginTop: 1
  },
  // CardProfile
  userCard: {
    backgroundColor: THEME.colors.cardColor, borderRadius: 5, padding: 16,
    borderWidth: 1, borderColor: THEME.colors.borderColor, gap: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 5,
    backgroundColor: THEME.colors.thirdColor,
    justifyContent: "center", alignItems: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.colors.secondaryColor
  },
  userInfo: {
    flex: 1,
    gap: 2
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.colors.fontColorTitle
  },
  userEmail: {
    fontSize: 13,
    color: THEME.colors.fontColorText
  },
  verifiedBadge: {
    fontSize: 12,
    color: "#4ade80",
    fontWeight: "600",
    marginTop: 2
  },
  unverifiedBadge: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600",
    marginTop: 2
  },
  memberSince: {
    fontSize: 12,
    color: THEME.colors.fontColorText,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: THEME.colors.borderColor
  },
  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  // Books
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.fontColorTitle
  },
  bookList: {
    backgroundColor: THEME.colors.cardColor, borderRadius: 5,
    borderWidth: 1, borderColor: THEME.colors.borderColor, overflow: "hidden",
  },
  bookRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.colors.borderColor, gap: 10,
  },
  bookIndex: {
    fontSize: 13, fontWeight: "600", color: THEME.colors.fontColorText, minWidth: 20,
  },
  bookInfo: { flex: 1 },
  bookName: { fontSize: 14, fontWeight: "600", color: THEME.colors.fontColorTitle },
  bookTime: {
    fontSize: 12, color: THEME.colors.fontColorText,
    fontVariant: ["tabular-nums"], minWidth: 55, textAlign: "right",
  },
  cloudActions: {
    flexDirection: "row", alignItems: "center", gap: 4,
  },
  syncBadge: {
    width: 24, alignItems: "center",
  },
  actionButtons: {},
  actionButton: {
    width: 28, height: 28, borderRadius: 5,
    justifyContent: "center", alignItems: "center",
  },
  actionButtonPressed: {
    backgroundColor: THEME.colors.thirdColor,
  },
  editButton: {
    width: 28, height: 28, borderRadius: 5,
    justifyContent: "center", alignItems: "center",
  },
  editButtonPressed: {
    backgroundColor: THEME.colors.thirdColor,
  },
  // Empty
  emptySection: { paddingVertical: 40, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 14, color: THEME.colors.fontColorText, textAlign: "center" },
  // Sign Out
  signOutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: THEME.colors.cardColor, borderRadius: 5, padding: 16,
    borderWidth: 1, borderColor: "#ef4444", minHeight: 52,
  },
  signOutButtonPressed: { opacity: 0.85 },
  signOutButtonDisabled: { opacity: 0.5 },
  signOutText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },
})
