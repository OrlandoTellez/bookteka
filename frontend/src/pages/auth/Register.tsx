import { SideLogo } from "@/components/pages/auth/SideLogo";
import styles from "./Login.module.css";
import { RegisterForm } from "@/components/pages/auth/RegisterForm";

const Register = () => {
  return (
    <>
      <section className={styles.container}>
        <SideLogo />
        <RegisterForm />
      </section>
    </>
  );
};

export default Register;
