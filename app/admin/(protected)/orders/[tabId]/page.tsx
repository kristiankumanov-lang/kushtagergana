import Link from "next/link";
import { getSql } from "@/lib/db/client";
import { OrderBoard, type MenuItem, type TabItem } from "./OrderBoard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface TabRow {
  id: string;
  label: string | null;
  room_label: string | null;
  status: "open" | "paid";
}

export default async function TabPage({ params }: { params: Promise<{ tabId: string }> }) {
  const { tabId } = await params;
  const sql = getSql();
  const [[tab], menuItems, tabItems] = await Promise.all([
    sql<TabRow[]>`
      select tabs.id, tabs.label, rooms.label as room_label, tabs.status
      from guesthouse.tabs as tabs
      left join guesthouse.rooms as rooms on rooms.id = tabs.room_id
      where tabs.id = ${tabId}
      limit 1
    `,
    sql<MenuItem[]>`
      select id, name, price::text as price, category, subcategory,
        subcategory_order, sort_order
      from guesthouse.menu_items
      where available = true
      order by category, subcategory_order, subcategory, sort_order, name
    `,
    sql<TabItem[]>`
      select id, item_name, item_price::text as item_price, quantity, status
      from guesthouse.tab_items
      where tab_id = ${tabId}
      order by added_at, id
    `,
  ]);

  if (!tab) {
    return <ClosedMessage message="Сметката не е намерена." />;
  }
  if (tab.status === "paid") {
    return <ClosedMessage message="Тази сметка вече е затворена." />;
  }

  return <OrderBoard tabId={tab.id} tabLabel={tab.room_label ?? tab.label ?? "Гости"} menuItems={menuItems} tabItems={tabItems} />;
}

function ClosedMessage({ message }: { message: string }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link className="inline-flex min-h-11 items-center text-lg font-semibold text-wood-700 underline" href="/admin/orders">← Към стаите</Link>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="font-display text-3xl text-wood-900">{message}</h1>
      </div>
    </main>
  );
}
