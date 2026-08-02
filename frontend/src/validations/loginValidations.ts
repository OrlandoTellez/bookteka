import z from "zod";

export const loginSchema = z.object({
  password: z
    .string()
    .min(6, "El minimo de caracteres es de 2")
    .max(100, "El maximo de caracateres de de 10"),
  email: z.email(),
});

export const registerSchema = z
  .object({
    name: z.string(),
    email: z.email(),
    password: z
      .string()
      .min(6, "El minimo de caracteres es de 2")
      .max(100, "El maximo de caracateres de de 10"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type LoginData = z.infer<typeof loginSchema>;

export type RegisterData = z.infer<typeof registerSchema>;
