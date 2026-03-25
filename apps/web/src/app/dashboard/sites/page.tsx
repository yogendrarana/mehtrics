import { getUserId } from "@/lib/auth";
import { getSiteList } from "@/services/site";
import { SitesView } from "./__components/sites-view";

export default async function SitesPage() {
  const userId = await getUserId();

  if (!userId) return null;

  const data = await getSiteList(userId);

  return (
    <div className="flex flex-col min-h-full">
      <SitesView data={data} />
    </div>
  );
}
