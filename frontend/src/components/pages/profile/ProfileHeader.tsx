import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./ProfileHeader.module.css";

const ProfileHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link className={styles.iconButton} to={"/"}>
          <ArrowLeft size={24} color="var(--font-color-title)" />
        </Link>

        <div className={styles.headerInfo}>
          <div>
            <h2>Mi Perfil</h2>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;