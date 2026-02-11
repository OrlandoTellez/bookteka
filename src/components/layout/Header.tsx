import logo from "@/assets/logo.svg";
import styles from "./Header.module.css";

export const Header = () => {
  return (
    <header className={styles.header}>
      <article>
        <div className={styles.logoContainer}>
          <img src={logo} alt="logo bookteka" />
          <p>Bookteka</p>
        </div>

        <div className={styles.buttonContainer}>
          <button>+ Añadir libro</button>
        </div>
      </article>
    </header>
  );
};
