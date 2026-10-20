import { Container } from "@mehtrics/ui/container";
import { Footer } from "@/components/marketing/footer";
import { Header } from "@/components/marketing/header";

export const metadata = {
  title: "Documentation - Mehtrics",
};

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container>
          <div className="border-x border-border py-20 px-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
            <p className="mt-4 text-muted-foreground">Coming soon.</p>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
