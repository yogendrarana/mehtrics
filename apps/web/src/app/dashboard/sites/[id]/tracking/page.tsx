import { SectionHeader } from "@/components/section-header";
import { Terminal, Code } from "lucide-react";
import { Card, CardContent } from "@mehtrics/ui/card";
import { CopySnippet } from "../../__components/copy-snippet";

type PageProps = { params: Promise<{ id: string }> };

export default async function TrackingScriptPage({ params }: PageProps) {
  const { id } = await params;
  
  const scriptTag = `<script defer src="https://mehtrics.com/script.js" data-site-id="${id}"></script>`;

  return (
    <div className="flex flex-col h-full">
      <SectionHeader 
        title="Tracking Script" 
        subtitle="Install this code snippet on your website to start tracking visitors."
      />

      <div className="p-6 space-y-6 max-w-4xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-sm bg-muted flex items-center justify-center">
                <Code size={16} className="text-foreground" />
            </div>
            <div>
                <h3 className="text-sm font-bold">Installation</h3>
                <p className="text-xs text-muted-foreground">Add this script tag to the <code className="bg-muted px-1 rounded-sm text-[10px]">&lt;head&gt;</code> section of your website.</p>
            </div>
          </div>

          <Card className="rounded-sm border-border/60 bg-muted/20 overflow-hidden">
            <CardContent className="p-0">
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/60">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">JavaScript Snippet</span>
                    <CopySnippet text={scriptTag} />
                </div>
                <div className="p-4 bg-muted/10 font-mono text-xs leading-relaxed break-all relative group">
                    <pre className="whitespace-pre-wrap">{scriptTag}</pre>
                </div>
            </CardContent>
          </Card>
          
          <div className="flex items-start gap-3 p-4 rounded-sm bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
            <Terminal size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
                <p className="text-xs font-bold text-blue-900 dark:text-blue-300">How it works</p>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-400/80 leading-normal">
                    Once installed, our script will automatically track pageviews, unique visitors, and sessions. You can also track custom events by adding few more lines of code.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
