import { useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import {
  Book as BookIcon,
  Clock,
  Trash2,
  ChevronRight,
  Cloud,
  CloudOff,
} from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"
import type { Book } from "@/shared/types/book"
import { formatTime } from "@/utils/time"
import { Modal } from "@/components/common"

interface CardBookListProps {
  book: Book
  onOpen: (book: Book) => void
  onDelete: (id: string) => void
  onSyncPress?: (book: Book) => void
}

export function CardBookList({ book, onOpen, onDelete, onSyncPress }: CardBookListProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const displayName = book.name.replace(".pdf", "")
  const lastRead = new Date(book.lastReadAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  })

  const progress = book.scrollPosition > 0 ? "En progreso" : "Sin empezar"

  return (
    <>
      <Pressable
        onPress={() => onOpen(book)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.iconWrapper}>
          <BookIcon size={16} color={THEME.colors.secondaryColor} />
        </View>

        <View style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Clock size={12} color={THEME.colors.fontColorText} />
            <Text style={styles.metaText}>
              {formatTime(book.readingTimeSeconds ?? 0)}
            </Text>
          </View>
          <View style={[
            styles.badge,
            book.scrollPosition > 0 ? styles.badgeActive : styles.badgeInactive,
          ]}>
            <Text style={[
              styles.badgeText,
              book.scrollPosition > 0 ? styles.badgeTextActive : styles.badgeTextInactive,
            ]}>
              {progress}
            </Text>
          </View>
          <Text style={styles.metaDate}>{lastRead}</Text>
        </View>

        <Pressable
          onPress={() => setShowDeleteModal(true)}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.deleteButtonVisible]}
          hitSlop={8}
        >
          <Trash2 size={16} color={THEME.colors.fontColorText} />
        </Pressable>

        <View style={styles.syncIndicator}>
          {book.isSynced ? (
            <Cloud size={16} color={THEME.colors.secondaryColor} />
          ) : (
            <CloudOff size={16} color={THEME.colors.fontColorText} />
          )}
        </View>

        <ChevronRight size={16} color={THEME.colors.fontColorText} />
      </Pressable>

      <Modal
        visible={showDeleteModal}
        title="¿Eliminar libro?"
        onClose={() => setShowDeleteModal(false)}
        actions={[
          {
            label: "Cancelar",
            variant: "cancel",
            onPress: () => setShowDeleteModal(false),
          },
          {
            label: "Eliminar",
            variant: "danger",
            onPress: () => {
              onDelete(book.id)
              setShowDeleteModal(false)
            },
          },
        ]}
      >
        <Text style={styles.deleteText}>
          Se eliminará "{displayName}" junto con todos sus marcadores y progreso.
        </Text>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.cardColor,
    borderWidth: 1,
    borderColor: THEME.colors.borderColor,
    borderRadius: 5,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  pressed: { opacity: 0.85 },
  iconWrapper: {
    width: 32,
    height: 40,
    borderRadius: 5,
    backgroundColor: THEME.colors.thirdColor,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  titleWrapper: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.fontColorTitle,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: THEME.colors.fontColorText,
  },
  metaDate: {
    fontSize: 12,
    color: THEME.colors.fontColorText,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeActive: {
    backgroundColor: THEME.colors.thirdColor,
  },
  badgeInactive: {
    backgroundColor: THEME.colors.previewColor,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  badgeTextActive: {
    color: THEME.colors.secondaryColor,
  },
  badgeTextInactive: {
    color: THEME.colors.fontColorText,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonVisible: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  syncIndicator: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  deleteText: {
    color: THEME.colors.fontColorText,
    fontSize: 15,
    lineHeight: 22,
  },
})
