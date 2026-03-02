import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client.ts";
import { clearDatabase, resetDatabase, syncBooksToCloud } from "@/lib/database";
import { toast } from "sonner";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      // Primero sincronizar datos locales al servidor antes de borrar
      toast.info("Guardando datos...");
      try {
        await syncBooksToCloud();
        console.log("Datos sincronizados al cerrar sesión");
      } catch (syncError) {
        console.warn("Error al sincronizar al logout:", syncError);
        // Continuar con el logout aunque falle la sincronización
      }

      // Eliminar la base de datos local
      await clearDatabase();

      // Reiniciar la conexión a la base de datos
      await resetDatabase();

      // Cerrar sesión en el servidor
      const { error } = await authClient.signOut();

      if (error) {
        console.error("Error al cerrar sesión:", error.message);
        setLoading(false);
        return;
      }

      navigate("/auth/login", { replace: true });
    } catch (err) {
      console.error("Error inesperado durante el logout:", err);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        padding: "8px 16px",
        backgroundColor: "var(--error-color)",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Cerrando sesión..." : "Cerrar Sesión"}
    </button>
  );
};
