import { loginAction } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const error = (await searchParams).error === "credentials";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-10">
      <section className="w-full rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="font-display text-3xl text-wood-900">Вход в управлението</h1>
        <p className="mt-2 text-ink-soft">Въведете потребителското си име и парола.</p>

        {error ? (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 font-semibold text-red-800">
            Грешно потребителско име или парола.
          </p>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-5">
          <label className="block font-semibold">
            Потребителско име
            <input
              className="mt-2 min-h-14 w-full rounded-xl border-2 border-wood-300 bg-parchment px-4 text-lg outline-none focus:border-accent-500"
              name="username"
              autoComplete="username"
              required
            />
          </label>
          <label className="block font-semibold">
            Парола
            <input
              className="mt-2 min-h-14 w-full rounded-xl border-2 border-wood-300 bg-parchment px-4 text-lg outline-none focus:border-accent-500"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="min-h-14 w-full rounded-xl bg-accent-500 px-5 text-lg font-bold text-white hover:bg-accent-600" type="submit">
            Вход
          </button>
        </form>
      </section>
    </main>
  );
}
