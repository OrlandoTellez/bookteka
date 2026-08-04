import { User, Settings } from "lucide-react";
import styles from "./ProfileTabs.module.css";

export type ProfileTab = "config" | "data";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

const ProfileTabs = ({ activeTab, onChange }: ProfileTabsProps) => {
  return (
    <nav className={styles.tabsRow}>
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "data"}
          className={`${styles.tab} ${activeTab === "data" ? styles.tabActive : ""}`}
          onClick={() => onChange("data")}
        >
          <User size={16} />
          Perfil
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "config"}
          className={`${styles.tab} ${activeTab === "config" ? styles.tabActive : ""}`}
          onClick={() => onChange("config")}
        >
          <Settings size={16} />
          Configuración
        </button>
      </div>
    </nav>
  );
};

export default ProfileTabs;