import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessionFromRequest } from "@mehtrics/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@mehtrics/ui";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const reqHeaders = new Headers(h);
  const session = await getSessionFromRequest({ headers: reqHeaders } as never);

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-1 flex flex-col">
        <Container className="flex-1 flex flex-col">
          <main className="flex-1 border-x border-border p-6 md:p-10 min-h-[calc(100vh-theme(spacing.16)-theme(spacing.24))]">
            {children}
          </main>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
