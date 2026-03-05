import { Header } from "@/components/layout/header";
import { Container, ScrollArea } from "@mehtrics/ui";
import { cn } from "@mehtrics/utils";
import { DashboardMenu } from "./__components/dashboard-menu";

interface Props {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: Props) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <Container
        className={cn(
          "flex-1 overflow-hidden",
          "md:grid md:grid-cols-[275px_minmax(0,1fr)]",
        )}
      >
        {/* sidebar */}
        <aside className="border-x hidden md:flex md:flex-col h-full overflow-hidden">
          <ScrollArea className="h-full">
            <DashboardMenu />
          </ScrollArea>
        </aside>

        {/* main */}
        <main className="flex-1 h-full overflow-hidden border-r">
          <ScrollArea className="h-full">{children}</ScrollArea>
        </main>
      </Container>
    </div>
  );
}
