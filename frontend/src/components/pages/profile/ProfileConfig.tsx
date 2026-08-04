import type { ReadingSettings, LibraryView } from "@/types/reading";
import { CloudSyncToggle } from "@/components/common/CloudSyncToggle";
import { DefaultViewCard } from "./DefaultViewCard";
import { ReadingSettingsCard } from "./ReadingSettingsCard";
import { LogoutButton } from "@/components/pages/auth/LogoutButton";
import styles from "./ProfileConfig.module.css";

interface ProfileConfigProps {
  defaultView?: LibraryView;
  onDefaultViewChange: (view: LibraryView) => void;
  readingSettings?: ReadingSettings;
  onReadingSettingsChange: (settings: ReadingSettings) => void;
  onReadingSettingsReset: () => void;
}

const ProfileConfig = ({
  defaultView,
  onDefaultViewChange,
  readingSettings,
  onReadingSettingsChange,
  onReadingSettingsReset,
}: ProfileConfigProps) => {
  return (
    <>
      <CloudSyncToggle />

      {defaultView && (
        <DefaultViewCard view={defaultView} onChange={onDefaultViewChange} />
      )}

      {readingSettings && (
        <ReadingSettingsCard
          settings={readingSettings}
          onChange={onReadingSettingsChange}
          onReset={onReadingSettingsReset}
        />
      )}

      <article className={styles.config}>
        <div className={styles.logoutContainer}>
          <LogoutButton />
        </div>
      </article>
    </>
  );
};

export default ProfileConfig;