import { SideLogo } from "@/components/auth/SideLogo";
import styles from "./Login.module.css";
import { RegisterForm } from "@/components/auth/RegisterForm";

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
