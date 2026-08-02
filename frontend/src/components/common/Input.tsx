import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./Input.module.css";
import type {
  UseFormRegister,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

interface InputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  options?: RegisterOptions<T>;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = <T extends FieldValues>({
  label,
  name,
  type,
  placeholder,
  register,
  options,
  error,
  onChange,
}: InputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const registration = register(name, options);

  return (
    <div className={styles.container}>
      <label htmlFor={name}>{label}</label>
      <div className={styles.inputWrapper}>
        <input
          type={inputType}
          id={name}
          placeholder={placeholder}
          {...registration}
          onChange={(event) => {
            void registration.onChange(event);
            onChange?.(event);
          }}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p style={{ color: "var(--error-color)" }}>{error}</p>}
    </div>
  );
};
