import { cn } from "@mehtrics/utils/cn";
import { Header } from "@/components/layout/header";

import { Container } from "@mehtrics/ui/container";
import { ScrollArea } from "@mehtrics/ui/scroll-area";

import { DashboardMenu } from "./__components/dashboard-menu";
import { MobileDashboardMenu } from "./__components/mobile-dashboard-menu";

interface Props {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: Props) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      {/* menu for md and small screen */}
      <div className="lg:hidden">
        <Container className="flex items-center justify-between border-b">
          <div className="border-x">
            <MobileDashboardMenu />
          </div>
        </Container>
      </div>

      <Container
        className={cn(
          "flex-1 overflow-hidden",
          "lg:grid lg:grid-cols-[275px_minmax(0,1fr)]",
        )}
      >
        {/* sidebar */}
        <aside className="border-l hidden lg:flex lg:flex-col h-full overflow-hidden">
          <ScrollArea className="h-full" hideScrollBar>
            <DashboardMenu />
          </ScrollArea>
        </aside>

        {/* main */}
        <main className="flex-1 h-full overflow-hidden border-x">
          <ScrollArea className="h-full" hideScrollBar>
            {children}
          </ScrollArea>
        </main>
      </Container>
    </div>
  );
}
