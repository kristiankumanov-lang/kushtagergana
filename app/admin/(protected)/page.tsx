import Link from "next/link";
import { cookies } from "next/headers";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { logoutAction } from "./actions";

export default async function AdminHomePage() {
  const rawToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const user = rawToken ? await getSessionUser(rawToken) : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-wood-900">Управление</h1>
          <p className="mt-1 text-ink-soft">Влезли сте като {user?.username}.</p>
        </div>
        <form action={logoutAction}>
          <button className="min-h-12 rounded-xl border-2 border-wood-300 px-5 font-semibold" type="submit">
            Изход
          </button>
        </form>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Link className="flex min-h-32 items-center justify-center rounded-2xl bg-accent-500 p-6 text-center text-2xl font-bold text-white shadow-md hover:bg-accent-600" href="/admin/menucorrection">
          Меню корекция
        </Link>
        <div aria-disabled="true" className="flex min-h-32 flex-col items-center justify-center rounded-2xl bg-wood-100 p-6 text-center text-2xl font-bold text-ink-soft opacity-70">
          Поръчки
          <span className="mt-1 text-sm font-medium">скоро</span>
        </div>
      </div>
    </main>
  );
}
