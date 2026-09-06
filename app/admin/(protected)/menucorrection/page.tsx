import Link from "next/link";
import { getSql } from "@/lib/db/client";
import {
  addMenuItemAction,
  toggleAvailabilityAction,
  updateMenuItemAction,
} from "./actions";
import { PrintButton } from "./PrintButton";

interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: "bar" | "kitchen";
  available: boolean;
}

const categoryLabels: Record<MenuItem["category"], string> = {
  bar: "Бар",
  kitchen: "Кухня",
};

function displayPrice(price: string) {
  return `${Number(price).toFixed(2)} €`;
}

export default async function MenuCorrectionPage() {
  const sql = getSql();
  const items = await sql<MenuItem[]>`
    select id, name, price::text as price, category, available
    from guesthouse.menu_items
    order by category, sort_order, name
  `;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
      <header className="print:hidden">
        <Link className="inline-flex min-h-11 items-center text-lg font-semibold text-wood-700 underline" href="/admin">
          ← Назад
        </Link>
        <h1 className="mt-4 font-display text-4xl text-wood-900">Меню корекция</h1>
        <p className="mt-2 text-ink-soft">Променете наличност, име или цена на артикул.</p>
      </header>

      <section className="mt-7 space-y-4 print:hidden" aria-label="Всички артикули">
        {items.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-ink-soft">Все още няма артикули.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-xl font-bold">{item.name}</h2>
                  <p className="mt-1 text-lg text-ink-soft">
                    {displayPrice(item.price)} · {categoryLabels[item.category]}
                  </p>
                </div>
                <form action={toggleAvailabilityAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="available" value={String(!item.available)} />
                  <button
                    type="submit"
                    aria-label={`${item.available ? "Изключи" : "Включи"} ${item.name}`}
                    className={`flex min-h-14 min-w-36 items-center justify-center rounded-xl px-4 font-bold ${
                      item.available ? "bg-green-100 text-green-900" : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    <span aria-hidden="true" className={`mr-3 h-7 w-12 rounded-full p-1 ${item.available ? "bg-green-600" : "bg-stone-500"}`}>
                      <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${item.available ? "translate-x-5" : ""}`} />
                    </span>
                    {item.available ? "Налично" : "Спряно"}
                  </button>
                </form>
              </div>

              <details className="mt-4 border-t border-wood-100 pt-4">
                <summary className="inline-flex min-h-12 cursor-pointer items-center rounded-xl border-2 border-wood-300 px-5 font-bold">
                  Редактирай
                </summary>
                <form action={updateMenuItemAction} className="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
                  <input type="hidden" name="id" value={item.id} />
                  <label className="font-semibold">
                    Име
                    <input className="mt-2 min-h-12 w-full rounded-xl border-2 border-wood-300 px-3 text-lg" name="name" defaultValue={item.name} required />
                  </label>
                  <label className="font-semibold">
                    Цена (€)
                    <input className="mt-2 min-h-12 w-full rounded-xl border-2 border-wood-300 px-3 text-lg" name="price" type="number" min="0" max="99999999.99" step="0.01" defaultValue={item.price} required />
                  </label>
                  <button className="min-h-12 rounded-xl bg-accent-500 px-5 font-bold text-white hover:bg-accent-600" type="submit">
                    Запази
                  </button>
                </form>
              </details>
            </article>
          ))
        )}
      </section>

      <section className="mt-10 rounded-2xl bg-white p-5 shadow-sm print:hidden sm:p-6">
        <h2 className="font-display text-2xl text-wood-900">Нов артикул</h2>
        <form action={addMenuItemAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="font-semibold sm:col-span-2">
            Име
            <input className="mt-2 min-h-12 w-full rounded-xl border-2 border-wood-300 px-3 text-lg" name="name" required />
          </label>
          <label className="font-semibold">
            Цена (€)
            <input className="mt-2 min-h-12 w-full rounded-xl border-2 border-wood-300 px-3 text-lg" name="price" type="number" min="0" max="99999999.99" step="0.01" required />
          </label>
          <label className="font-semibold">
            Категория
            <select className="mt-2 min-h-12 w-full rounded-xl border-2 border-wood-300 bg-white px-3 text-lg" name="category" defaultValue="kitchen">
              <option value="kitchen">Кухня</option>
              <option value="bar">Бар</option>
            </select>
          </label>
          <button className="min-h-14 rounded-xl bg-accent-500 px-5 text-lg font-bold text-white hover:bg-accent-600 sm:col-span-2" type="submit">
            Добави артикул
          </button>
        </form>
      </section>

      <div className="mt-8 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <section className="hidden print:block" aria-label="Меню за печат">
        {(["bar", "kitchen"] as const).map((category) => {
          const availableItems = items.filter((item) => item.category === category && item.available);
          if (availableItems.length === 0) return null;
          return (
            <div key={category} className="mb-8 break-inside-avoid">
              <h1 className="mb-3 border-b border-black pb-1 text-2xl font-bold">{categoryLabels[category]}</h1>
              <ul>
                {availableItems.map((item) => (
                  <li key={item.id} className="flex justify-between gap-8 py-1 text-lg">
                    <span>{item.name}</span>
                    <span className="whitespace-nowrap">{displayPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </main>
  );
}
