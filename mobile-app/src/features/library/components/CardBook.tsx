import { useState } from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import {
  Book as BookIcon,
  Clock,
  Trash2,
  Cloud,
  CloudOff,
} from "lucide-react-native"
import { THEME } from "@/shared/lib/theme"
import type { Book } from "@/shared/types/book"
import { formatTime } from "@/utils/time"
import { Modal } from "@/components/common"

interface CardBookProps {
  book: Book
  onOpen: (book: Book) => void
  onDelete: (id: string) => void
  onSyncPress?: (book: Book) => void
}

export function CardBook({ book, onOpen, onDelete, onSyncPress }: CardBookProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const progress =
    book.totalPages && book.totalPages > 0
      ? Math.min(
          Math.round(
            ((book.scrollPosition ?? 0) / (book.totalPages ?? 1)) * 100,
          ),
          100,
        )
      : 0

  const displayName = book.name.replace(".pdf", "")
  const lastRead = new Date(book.lastReadAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <>
      <Pressable
        onPress={() => onOpen(book)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {/* Header: icon + content */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <BookIcon size={22} color={THEME.colors.secondaryColor} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {displayName}
            </Text>

            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <Clock size={13} color={THEME.colors.fontColorText} />
                <Text style={styles.metaText}>
                  {formatTime(book.readingTimeSeconds ?? 0)}
                </Text>
              </View>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>
                {book.scrollPosition > 0 ? "En progreso" : "Sin empezar"}
              </Text>
            </View>

            <Text style={styles.lastRead}>Última lectura: {lastRead}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => onOpen(book)}
            style={({ pressed }) => [styles.readButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.readButtonText}>
              {book.scrollPosition > 0 ? "Continuar leyendo" : "Empezar a leer"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onSyncPress?.(book)}
            style={styles.iconButton}
            hitSlop={8}
          >
            {book.isSynced ? (
              <Cloud size={18} color={THEME.colors.secondaryColor} />
            ) : (
              <CloudOff size={18} color={THEME.colors.fontColorText} />
            )}
          </Pressable>

          <Pressable
            onPress={() => setShowDeleteModal(true)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.deleteButtonHover]}
            hitSlop={8}
          >
            <Trash2 size={18} color={THEME.colors.fontColorText} />
          </Pressable>
        </View>
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
    backgroundColor: THEME.colors.cardColor,
    borderRadius: 5,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.borderColor,
    gap: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pressed: { opacity: 0.85 },
  header: {
    flexDirection: "row",
    gap: 16,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: THEME.colors.thirdColor,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.fontColorTitle,
    lineHeight: 21,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: THEME.colors.fontColorText,
  },
  metaDot: {
    fontSize: 13,
    color: THEME.colors.fontColorText,
  },
  lastRead: {
    fontSize: 12,
    color: THEME.colors.fontColorText,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  readButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    backgroundColor: THEME.colors.secondaryColor,
    alignItems: "center",
    justifyContent: "center",
  },
  readButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonHover: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  deleteText: {
    color: THEME.colors.fontColorText,
    fontSize: 15,
    lineHeight: 22,
  },
})
