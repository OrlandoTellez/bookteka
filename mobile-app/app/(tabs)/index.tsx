import { useState, useEffect, useMemo, useCallback } from "react"
import {
  View, Pressable, RefreshControl, ScrollView, Alert, StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Book as BookIcon, Plus } from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"
import { useBookStore } from "@/shared/store/bookStore"
import type { Book } from "@/shared/types/book"
import { normalizeText } from "@/utils/text"
import { BookGrid } from "@/features/library/components/BookGrid"
import { BookList } from "@/features/library/components/BookList"
import { PDFUploader } from "@/features/library/components/PDFUploader"
import { EmptyState, Loading } from "@/components/common"
import { LibraryHeader } from "@/features/library/components/LibraryHeader"
import { LibrarySearchBar } from "@/features/library/components/LibrarySearchBar"
import { LibraryToolbar, type FilterStatus, type SortBy, type ViewMode } from "@/features/library/components/LibraryToolbar"

const ITEMS_PER_PAGE = 6

export default function LibraryScreen() {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [sortBy, setSortBy] = useState<SortBy>("recent")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showUploader, setShowUploader] = useState(false)

  const { books, isLoading, loadBooks, deleteBook, getBookById, setCurrentBook, setCurrentView, syncBookToCloud } = useBookStore()

  useEffect(() => { loadBooks() }, [])

  // reset pagination on filter change
  useEffect(() => { setCurrentPage(1) }, [searchQuery, filterStatus, sortBy])

  const handleOpenBook = useCallback(async (book: Book) => {
    const freshBook = await getBookById(book.id)
    if (freshBook) {
      setCurrentBook(freshBook)
      setCurrentView("reader")
      router.push(`/reader/${book.id}`)
    }
  }, [getBookById, setCurrentBook, setCurrentView, router])

  const handleDelete = useCallback(async (id: string) => {
    try { await deleteBook(id) }
    catch (err) { console.error("Error deleting book:", err) }
  }, [deleteBook])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    setCurrentPage(1)
    await loadBooks()
    setRefreshing(false)
  }, [loadBooks])

  const handleUploadComplete = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const handleSyncPress = useCallback(async (book: Book) => {
    try {
      await syncBookToCloud(book.id)
      await loadBooks()
      Alert.alert("Sincronizado", `"${book.name.replace(/\.pdf$/i, "")}" se ha sincronizado correctamente.`)
    } catch (error) {
      Alert.alert("Error", `No se pudo sincronizar "${book.name.replace(/\.pdf$/i, "")}". Verifica tu conexión.`)
    }
  }, [syncBookToCloud, loadBooks])

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    requestAnimationFrame(() => {
      setCurrentPage((p) => p + 1)
      setIsLoadingMore(false)
    })
  }, [isLoadingMore])

  // filter + sort
  const processedBooks = useMemo(() => {
    let filtered = [...books]
    if (searchQuery.trim()) {
      const q = normalizeText(searchQuery)
      filtered = filtered.filter((b) => normalizeText(b.name).includes(q))
    }
    if (filterStatus === "reading") {
      filtered = filtered.filter((b) => (b.scrollPosition ?? 0) > 0)
    } else if (filterStatus === "unstarted") {
      filtered = filtered.filter((b) => (b.scrollPosition ?? 0) === 0)
    } else if (filterStatus === "completed") {
      filtered = filtered.filter((b) => b.totalPages != null && b.totalPages > 0 && (b.scrollPosition ?? 0) >= b.totalPages)
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent": return b.lastReadAt - a.lastReadAt
        case "name_asc": return a.name.localeCompare(b.name)
        case "name_desc": return b.name.localeCompare(a.name)
        case "time_desc": return (b.readingTimeSeconds ?? 0) - (a.readingTimeSeconds ?? 0)
        default: return 0
      }
    })
    return filtered
  }, [books, searchQuery, filterStatus, sortBy])

  const visibleBooks = useMemo(
    () => processedBooks.slice(0, currentPage * ITEMS_PER_PAGE),
    [processedBooks, currentPage],
  )
  const hasMore = visibleBooks.length < processedBooks.length

  if (isLoading && books.length === 0) return <Loading text="Cargando libros..." />

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <LibraryHeader bookCount={books.length} />

        {books.length > 0 && (
          <LibrarySearchBar value={searchQuery} onChangeText={setSearchQuery} />
        )}

        {books.length > 0 && (
          <LibraryToolbar
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        {books.length > 0 ? (
          viewMode === "grid" ? (
            <BookGrid
              books={visibleBooks} isLoading={false}
              onOpen={handleOpenBook} onDelete={handleDelete} onSyncPress={handleSyncPress}
              refreshing={refreshing} onRefresh={handleRefresh}
              pagination={{ visibleCount: visibleBooks.length, totalCount: processedBooks.length, hasMore, onLoadMore: handleLoadMore, isLoadingMore }}
            />
          ) : (
            <BookList
              books={visibleBooks} isLoading={false}
              onOpen={handleOpenBook} onDelete={handleDelete} onSyncPress={handleSyncPress}
              refreshing={refreshing} onRefresh={handleRefresh}
              pagination={{ visibleCount: visibleBooks.length, totalCount: processedBooks.length, hasMore, onLoadMore: handleLoadMore, isLoadingMore }}
            />
          )
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyScroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={THEME.colors.secondaryColor} />}
          >
            <EmptyState icon={BookIcon} title="Tu biblioteca está vacía" subtitle="Sube tu primer libro para comenzar a leer" />
          </ScrollView>
        )}

        <PDFUploader visible={showUploader} onClose={() => setShowUploader(false)} onUploadComplete={handleUploadComplete} />

        <Pressable onPress={() => setShowUploader(true)} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
          <Plus size={24} color="#fff" />
        </Pressable>
      </View>
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
    backgroundColor: THEME.colors.primaryColor
  },
  emptyScroll: {
    flexGrow: 1,
    justifyContent: "center"
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 5,
    backgroundColor: THEME.colors.secondaryColor,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }]
  },
})
