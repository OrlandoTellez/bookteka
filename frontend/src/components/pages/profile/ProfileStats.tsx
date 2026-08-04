import { Clock, BookOpen, TrendingUp } from "lucide-react";
import type { Book } from "@/types/book";
import { formatTime } from "@/utils/time";
import { StatCard } from "./StatCard";
import styles from "./ProfileStats.module.css";

interface ProfileStatsProps {
  books: Book[];
}

const ProfileStats = ({ books }: ProfileStatsProps) => {
  const totalBooks = books.length;
  const totalReadingTime = books.reduce(
    (acc, book) => acc + book.readingTimeSeconds,
    0,
  );
  const booksStarted = books.filter((book) => book.scrollPosition > 0).length;
  const averageTimePerBook =
    totalBooks > 0 ? Math.round(totalReadingTime / totalBooks) : 0;

  const stats = [
    {
      icon: Clock,
      iconProps: { size: 20, color: "var(--secondary-color)" },
      label: "Tiempo total",
      value: formatTime(totalReadingTime),
    },
    {
      icon: BookOpen,
      iconProps: { size: 20, color: "#4ade80" },
      label: "Libros",
      value: totalBooks.toString(),
    },
    {
      icon: TrendingUp,
      iconProps: { size: 20, color: "#5ea2f5" },
      label: "En progreso",
      value: booksStarted.toString(),
    },
    {
      icon: Clock,
      iconProps: { size: 20, color: "#d6a422" },
      label: "Promedio/libro",
      value: formatTime(averageTimePerBook),
    },
  ];

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <StatCard
            key={index}
            icon={<Icon {...stat.iconProps} />}
            label={stat.label}
            value={stat.value}
          />
        );
      })}
    </div>
  );
};

export default ProfileStats;