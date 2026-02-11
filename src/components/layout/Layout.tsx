import { Header } from "./Header";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <div>
        <Header />

        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
};
