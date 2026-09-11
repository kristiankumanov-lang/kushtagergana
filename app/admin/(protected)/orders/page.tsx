import Link from "next/link";
import { getSql } from "@/lib/db/client";
import { createGuestTabAction, openRoomTabAction } from "./actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface RoomRow {
  id: number;
  label: string;
  tab_id: string | null;
  total: string;
}

function displayPrice(price: string) {
  return `${Number(price).toFixed(2)} €`;
}

export default async function OrdersPage() {
  const sql = getSql();
  const rooms = await sql<RoomRow[]>`
    select rooms.id, rooms.label, tabs.id as tab_id,
      coalesce(sum(tab_items.item_price * tab_items.quantity)
        filter (where tab_items.status != 'cancelled'), 0)::text as total
    from guesthouse.rooms as rooms
    left join guesthouse.tabs as tabs
      on tabs.room_id = rooms.id and tabs.status = 'open'
    left join guesthouse.tab_items as tab_items on tab_items.tab_id = tabs.id
    where rooms.active = true
    group by rooms.id, rooms.label, tabs.id
    order by rooms.id
  `;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 pb-12 sm:px-6 sm:py-10">
      <header>
        <Link className="inline-flex min-h-11 items-center text-lg font-semibold text-wood-700 underline" href="/admin">
          ← Назад
        </Link>
        <h1 className="mt-4 font-display text-4xl text-wood-900">Поръчки</h1>
      </header>

      <details className="mt-7 rounded-2xl bg-white p-4 shadow-sm">
        <summary className="flex min-h-14 cursor-pointer items-center justify-center rounded-xl bg-accent-500 px-5 text-lg font-bold text-white">
          Добави гости
        </summary>
        <form action={createGuestTabAction} className="mt-4 space-y-4">
          <label className="block font-semibold">
            Име на сметката
            <input className="mt-2 min-h-12 w-full rounded-xl border-2 border-wood-300 px-3 text-lg" name="label" placeholder="маса 1, Иван от селото" required />
          </label>
          <button className="min-h-14 w-full rounded-xl bg-accent-500 px-5 text-lg font-bold text-white hover:bg-accent-600" type="submit">
            Отвори сметка
          </button>
        </form>
      </details>

      <section className="mt-7 grid grid-cols-2 gap-4" aria-label="Стаи">
        {rooms.map((room) =>
          room.tab_id ? (
            <Link key={room.id} href={`/admin/orders/${room.tab_id}`} className="flex min-h-32 flex-col items-center justify-center rounded-2xl bg-accent-500 p-4 text-center text-xl font-bold text-white shadow-md hover:bg-accent-600">
              <span>{room.label}</span>
              <span className="mt-2 text-lg">{displayPrice(room.total)}</span>
            </Link>
          ) : (
            <form key={room.id} action={openRoomTabAction}>
              <input type="hidden" name="roomId" value={room.id} />
              <button className="min-h-32 w-full rounded-2xl border-2 border-wood-300 bg-wood-100 p-4 text-xl font-bold text-wood-900 shadow-sm hover:bg-white" type="submit">
                {room.label}
              </button>
            </form>
          ),
        )}
      </section>
    </main>
  );
}
