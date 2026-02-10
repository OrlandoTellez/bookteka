import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <div>
        <Header />

        <main>{children}</main>
      </div>
    </>
  );
};
