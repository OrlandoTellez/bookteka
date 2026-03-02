import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client.ts";
import { useBookStore } from "@/store/bookStore";
import { Loading } from "@/components/common/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data: session, isPending, error } = authClient.useSession();
  const { loadBooks, syncBooks, books } = useBookStore();

  useEffect(() => {
    if (session?.user?.id && !isPending && books.length === 0) {
      loadBooks().then(() => {
        syncBooks();
      });
    }
  }, [session?.user?.id, isPending, loadBooks, syncBooks, books.length]);

  if (isPending) {
    return <Loading text="Cargando contenido..." />;
  }

  if (!session || error) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};
