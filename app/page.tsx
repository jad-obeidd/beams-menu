import { Menu } from "@/components/Menu";
import { loadMenu } from "@/lib/db";

// Always fresh, so a barista's change shows the next time anyone opens the menu.
export const dynamic = "force-dynamic";

export default async function Home() {
  return <Menu sections={await loadMenu()} />;
}
