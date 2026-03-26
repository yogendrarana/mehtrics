import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Docs from "./__components/docs";

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Docs />
      <Footer />
    </div>
  );
}
