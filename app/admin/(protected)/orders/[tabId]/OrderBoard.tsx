"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addItemAction, cancelTabItemAction, payTabAction, sendToKitchenAction } from "./actions";

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: "bar" | "kitchen";
  subcategory: string;
  subcategory_order: number;
  sort_order: number;
}

export interface TabItem {
  id: string;
  item_name: string;
  item_price: string;
  quantity: number;
  status: "added" | "sent_to_kitchen" | "ready" | "cancelled";
}

interface OrderBoardProps {
  tabId: string;
  tabLabel: string;
  menuItems: MenuItem[];
  tabItems: TabItem[];
}

const statusLabels: Record<TabItem["status"], string> = {
  added: "добавена",
  sent_to_kitchen: "изпратена",
  ready: "готова",
  cancelled: "отменена",
};

function displayPrice(price: string | number) {
  return `${Number(price).toFixed(2)} €`;
}

export function OrderBoard({ tabId, tabLabel, menuItems, tabItems }: OrderBoardProps) {
  const router = useRouter();
  const [category, setCategory] = useState<MenuItem["category"]>("bar");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const groups = useMemo(() => {
    const categoryItems = menuItems.filter((item) => item.category === category);
    return Array.from(new Set(categoryItems.map((item) => item.subcategory))).map((name) => ({
      name,
      items: categoryItems.filter((item) => item.subcategory === name),
    }));
  }, [category, menuItems]);

  const total = tabItems.reduce(
    (sum, item) => sum + (item.status === "cancelled" ? 0 : Number(item.item_price) * item.quantity),
    0,
  );
  const addedCount = tabItems.reduce((sum, item) => sum + (item.status === "added" ? item.quantity : 0), 0);

  function runMutation(mutation: () => Promise<void>, afterSuccess?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        await mutation();
        afterSuccess?.();
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Възникна грешка. Опитайте отново.");
      }
    });
  }

  function openQuantityDialog(item: MenuItem) {
    setQuantity(1);
    setSelectedItem(item);
  }

  function cancelItem(item: TabItem) {
    if (item.status === "added" && item.quantity > 1 && !window.confirm(`Да отменя ли ${item.quantity} бр. ${item.item_name}?`)) return;
    if (item.status === "sent_to_kitchen" && !window.confirm("Артикулът вече е изпратен към кухнята. Да бъде ли отменен?")) return;
    runMutation(() => cancelTabItemAction(item.id));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 pb-40 sm:px-6 sm:py-8">
      <header>
        <Link className="inline-flex min-h-11 items-center text-lg font-semibold text-wood-700 underline" href="/admin/orders">← Към стаите</Link>
        <h1 className="mt-2 font-display text-4xl text-wood-900">{tabLabel}</h1>
      </header>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-100 p-4 font-semibold text-red-900">{error}</p>}

      <div className="mt-5 grid grid-cols-2 gap-3" aria-label="Категория">
        {(["bar", "kitchen"] as const).map((value) => (
          <button key={value} type="button" onClick={() => setCategory(value)} className={`min-h-14 rounded-xl text-xl font-bold ${category === value ? "bg-accent-500 text-white" : "border-2 border-wood-300 bg-wood-100 text-wood-900"}`}>
            {value === "bar" ? "Бар" : "Кухня"}
          </button>
        ))}
      </div>

      <section className="mt-6 space-y-7" aria-label={category === "bar" ? "Бар" : "Кухня"}>
        {groups.length === 0 && <p className="rounded-2xl bg-white p-5 text-ink-soft">Няма налични артикули.</p>}
        {groups.map((group) => (
          <section key={group.name}>
            <h2 className="sticky top-0 z-10 -mx-1 rounded-xl bg-wood-100/95 px-3 py-2 text-xl font-bold text-wood-900 shadow-sm backdrop-blur">{group.name}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {group.items.map((item) => (
                <button key={item.id} type="button" disabled={isPending} onClick={() => openQuantityDialog(item)} className="flex min-h-24 flex-col items-start justify-between rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-wood-100 disabled:opacity-60">
                  <span className="break-words text-lg font-bold text-wood-900">{item.name}</span>
                  <span className="mt-2 font-semibold text-accent-600">{displayPrice(item.price)}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className="mt-10" aria-labelledby="bill-heading">
        <h2 id="bill-heading" className="font-display text-3xl text-wood-900">Сметка</h2>
        <div className="mt-4 space-y-3">
          {tabItems.length === 0 && <p className="rounded-2xl bg-white p-5 text-ink-soft">Сметката е празна.</p>}
          {tabItems.map((item) => {
            const cancelled = item.status === "cancelled";
            return (
              <article key={item.id} className={`rounded-2xl p-4 shadow-sm ${cancelled ? "bg-stone-100 text-ink-soft line-through" : "bg-white"}`}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-bold">{item.item_name}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{item.quantity} × {displayPrice(item.item_price)} = <strong>{displayPrice(Number(item.item_price) * item.quantity)}</strong></p>
                    <p className="mt-1 text-sm font-semibold">{statusLabels[item.status]}</p>
                  </div>
                  {item.status === "added" && (
                    <button type="button" disabled={isPending} onClick={() => cancelItem(item)} aria-label={`Отмени ${item.item_name}`} className="min-h-12 min-w-12 rounded-xl border-2 border-wood-300 text-xl font-bold no-underline disabled:opacity-60">✕</button>
                  )}
                  {item.status === "sent_to_kitchen" && (
                    <button type="button" disabled={isPending} onClick={() => cancelItem(item)} className="min-h-12 rounded-xl border-2 border-terracotta-500 px-4 font-bold text-terracotta-700 no-underline disabled:opacity-60">Отмени</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-wood-300 bg-white/95 p-3 shadow-[0_-4px_18px_rgba(0,0,0,0.12)] backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 flex items-center justify-between gap-3">
            <strong className="text-xl text-wood-900">Общо: {displayPrice(total)}</strong>
            {addedCount > 0 && <span className="rounded-full bg-terracotta-500 px-3 py-1 text-sm font-extrabold text-white">{addedCount} неизпратени</span>}
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button type="button" disabled={isPending || addedCount === 0} onClick={() => runMutation(() => sendToKitchenAction(tabId))} className="min-h-14 rounded-xl bg-accent-500 px-3 font-bold text-white disabled:bg-stone-300 disabled:text-stone-600">{isPending ? "Моля, изчакайте…" : "Изпрати поръчка за кухнята"}</button>
            <button type="button" disabled={isPending} onClick={() => { if (window.confirm(`Потвърждавате ли плащане на ${displayPrice(total)}? Сметката ще бъде затворена.`)) runMutation(() => payTabAction(tabId)); }} className="min-h-14 rounded-xl bg-wood-700 px-4 font-bold text-white hover:bg-wood-900 disabled:opacity-60">Плащане</button>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="presentation" onMouseDown={() => !isPending && setSelectedItem(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="quantity-title" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 id="quantity-title" className="text-2xl font-bold text-wood-900">{selectedItem.name}</h2>
            <p className="mt-1 text-lg text-ink-soft">{displayPrice(selectedItem.price)}</p>
            <div className="mt-6 flex items-center justify-center gap-5">
              <button type="button" disabled={isPending || quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="min-h-14 min-w-14 rounded-xl border-2 border-wood-300 text-3xl font-bold disabled:opacity-40">−</button>
              <output className="min-w-12 text-center text-3xl font-bold">{quantity}</output>
              <button type="button" disabled={isPending || quantity === 99} onClick={() => setQuantity((value) => Math.min(99, value + 1))} className="min-h-14 min-w-14 rounded-xl border-2 border-wood-300 text-3xl font-bold disabled:opacity-40">+</button>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button type="button" disabled={isPending} onClick={() => setSelectedItem(null)} className="min-h-14 rounded-xl border-2 border-wood-300 font-bold">Отказ</button>
              <button type="button" disabled={isPending} onClick={() => runMutation(() => addItemAction(tabId, selectedItem.id, quantity), () => setSelectedItem(null))} className="min-h-14 rounded-xl bg-accent-500 font-bold text-white disabled:opacity-60">{isPending ? "Добавяне…" : "Добави"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
