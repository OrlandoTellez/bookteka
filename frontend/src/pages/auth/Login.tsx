import { SideLogo } from "@/components/pages/auth/SideLogo";
import styles from "./Login.module.css";
import { LoginForm } from "@/components/pages/auth/LoginForm";

const Login = () => {
  return (
    <>
      <section className={styles.container}>
        <SideLogo />
        <LoginForm />
      </section>
    </>
  );
};

export default Login;
