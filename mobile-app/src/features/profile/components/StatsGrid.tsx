import { View, StyleSheet } from "react-native"
import type { LucideIcon } from "lucide-react-native"
import { StatCard } from "./StatCard"

export interface StatItem {
  icon: LucideIcon
  iconColor: string
  label: string
  value: string
}

interface StatsGridProps {
  items: StatItem[]
}

export function StatsGrid({ items }: StatsGridProps) {
  return (
    <View style={styles.statsGrid}>
      {items.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          iconColor={stat.iconColor}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
})
