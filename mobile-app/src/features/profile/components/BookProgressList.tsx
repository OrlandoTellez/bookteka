import { Pressable, Text, View, StyleSheet } from "react-native"
import {
  BookOpen, Cloud, CloudOff, CloudUpload, CloudDownload, Edit2, TrendingUp,
} from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"
import { formatTime } from "@/utils/time"
import type { Book } from "@/shared/types/book"

interface BookProgressListProps {
  books: Book[]
  onDownload: (bookId: string) => void
  onUploadToCloud: (bookId: string) => void
  onEditTime: (book: Book) => void
}

export function BookProgressList({
  books,
  onDownload,
  onUploadToCloud,
  onEditTime,
}: BookProgressListProps) {
  if (books.length === 0) {
    return (
      <View style={styles.emptySection}>
        <BookOpen size={32} color={THEME.colors.fontColorText} />
        <Text style={styles.emptyText}>Aún no tienes libros. ¡Añade uno para empezar!</Text>
      </View>
    )
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <TrendingUp size={16} color={THEME.colors.fontColorTitle} />
        <Text style={styles.sectionTitle}>Todos los libros</Text>
      </View>
      <View style={styles.bookList}>
        {books.map((book, index) => (
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

              {book.isSynced ? (
                <Pressable
                  onPress={() => onDownload(book.id)}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                  hitSlop={8}
                >
                  <CloudDownload size={18} color={THEME.colors.secondaryColor} />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => onUploadToCloud(book.id)}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
                  hitSlop={8}
                >
                  <CloudUpload size={18} color="#f97316" />
                </Pressable>
              )}
            </View>

            {/* Edit time button */}
            <Pressable
              onPress={() => onEditTime(book)}
              style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
              hitSlop={8}
            >
              <Edit2 size={16} color={THEME.colors.fontColorTitle} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.fontColorTitle,
  },
  bookList: {
    backgroundColor: THEME.colors.cardColor,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: THEME.colors.borderColor,
    overflow: "hidden",
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.colors.borderColor, gap: 10,
  },
  bookIndex: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.fontColorText,
    minWidth: 20,
  },
  bookInfo: {
    flex: 1
  },
  bookName: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.fontColorTitle
  },
  bookTime: {
    fontSize: 12,
    color: THEME.colors.fontColorText,
    fontVariant: ["tabular-nums"],
    minWidth: 55,
    textAlign: "right",
  },
  cloudActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  syncBadge: {
    width: 24,
    alignItems: "center",
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonPressed: {
    backgroundColor: THEME.colors.thirdColor,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonPressed: {
    backgroundColor: THEME.colors.thirdColor,
  },
  emptySection: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12
  },
  emptyText: {
    fontSize: 14,
    color: THEME.colors.fontColorText,
    textAlign: "center"
  },
})
