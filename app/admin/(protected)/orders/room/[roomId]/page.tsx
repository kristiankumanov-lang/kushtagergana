import Link from "next/link";
import { redirect } from "next/navigation";
import { getSql } from "@/lib/db/client";
import { OrderBoard, type MenuItem } from "../../[tabId]/OrderBoard";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface RoomRow {
  id: number;
  label: string;
  tab_id: string | null;
}

/**
 * A room without an open tab. Shows the menu but writes nothing to the DB —
 * the tab is created by the first item added (addItemAction with tabId=null).
 * If the room already has an open tab (e.g. the other sister just opened it),
 * go straight to that tab.
 */
export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId: roomIdText } = await params;
  const roomId = Number(roomIdText);
  if (!Number.isInteger(roomId)) return <NotFound />;

  const sql = getSql();
  const [[room], menuItems] = await Promise.all([
    sql<RoomRow[]>`
      select rooms.id, rooms.label, tabs.id as tab_id
      from guesthouse.rooms as rooms
      left join guesthouse.tabs as tabs
        on tabs.room_id = rooms.id and tabs.status = 'open'
      where rooms.id = ${roomId} and rooms.active = true
      limit 1
    `,
    sql<MenuItem[]>`
      select id, name, price::text as price, category, subcategory,
        subcategory_order, sort_order
      from guesthouse.menu_items
      where available = true
      order by category, subcategory_order, subcategory, sort_order, name
    `,
  ]);

  if (!room) return <NotFound />;
  if (room.tab_id) redirect(`/admin/orders/${room.tab_id}`);

  return <OrderBoard tabId={null} roomId={room.id} tabLabel={room.label} menuItems={menuItems} tabItems={[]} />;
}

function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link className="inline-flex min-h-11 items-center text-lg font-semibold text-wood-700 underline" href="/admin/orders">← Към стаите</Link>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="font-display text-3xl text-wood-900">Стаята не е намерена.</h1>
      </div>
    </main>
  );
}
