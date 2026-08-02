import { Navigate } from "react-router-dom";
import { useAuthSession } from "@/lib/useAuthSession";
import { Loading } from "@/components/common/Loading";

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending } = useAuthSession();

  if (isPending) return <Loading text="Verificando..." />;

  // Si ya hay sesión, redirigir al Index
  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
