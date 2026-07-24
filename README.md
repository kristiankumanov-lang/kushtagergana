# Къща за гости Гергана — уебсайт

Next.js (App Router) сайт за къща за гости в с. Радуил, Рила планина. Единична страница
(smooth-scroll секции), резервация с проверка на свободни дати през Booking.com iCal
синхронизация и изпращане на заявки по имейл през Resend.

## Стартиране локално

```bash
npm install
npm run dev
```

Отворете [http://localhost:3000](http://localhost:3000).

## Променливи на средата

Копирайте `.env.example` в `.env.local` и попълнете:

| Променлива | За какво служи |
| --- | --- |
| `BOOKING_ICAL_URL` | Booking.com Extranet → Calendar → Sync calendars → export URL. Без нея сайтът показва „Наличността се потвърждава от домакина" вместо календар със заети дати. |
| `RESEND_API_KEY` | API ключ от [resend.com](https://resend.com) — изпраща имейл при нова заявка за резервация. |
| `BOOKING_EMAIL_FROM` | Верифициран изпращач в Resend, напр. `Къща Гергана <booking@your-domain.bg>`. |
| `BOOKING_EMAIL_TO` | Имейлът на домакина, който получава заявките. |
| `NEXT_PUBLIC_SITE_URL` | Публичният домейн на сайта (за SEO canonical/OG тагове и sitemap). |

Без настроени Resend променливи заявките през формата връщат грешка вместо да замине
имейл — задължително се настройват преди пускане в продукция.

## Deploy (Vercel)

1. Push-нете репото в GitHub/GitLab и импортирайте в [vercel.com/new](https://vercel.com/new).
2. Добавете горните env variables в Vercel → Project Settings → Environment Variables.
3. Всеки push към main деплойва автоматично. Няма нужда от допълнителна конфигурация —
   `next.config.ts` вече съдържа нужните настройки за изображенията.

## За собственика: как се редактира съдържанието

Няма нужда от технически познания за дребни промени в текста:

- **Текстове (BG/EN):** всичко е в [lib/i18n/dictionary.ts](lib/i18n/dictionary.ts) — един
  файл, ясно разделен на `bg` и `en` обекти по секции (hero, about, kitchen, pricing...).
  Редактирате текста между кавичките и запазвате файла.
- **Цени:** също в `dictionary.ts`, обект `pricing.rows`.
- **Снимки:** качете реални снимки в `public/gallery/{house,kitchen,yard,mountain}/` със
  същите имена като плейсхолдърите (напр. `house-1.svg` → `house-1.jpg`) и обновете
  разширението в [lib/gallery.ts](lib/gallery.ts). Hero снимките са `public/hero-winter.*`
  и `public/hero-summer.*`.
- **Контакти/социални мрежи:** [components/layout/Footer.tsx](components/layout/Footer.tsx).

### Плейсхолдър снимки

Всички снимки в момента са генерирани warm-тон SVG placeholder-и (означени с надпис
„ЗАМЕНЕТЕ С РЕАЛНА"), направени със `scripts/generate-placeholders.mjs`, само за да
демонстрират оформлението. **Трябва да се заменят с истински снимки на къщата преди
пускане в продукция.**

## Booking.com iCal синхронизация

- `/api/availability` чете `BOOKING_ICAL_URL`, парсва заетите периоди (node-ical) и ги
  кешира за 45 минути (ISR revalidate).
- Календарът в секция „Резервация" блокира заетите дати и не позволява избор на период,
  който ги пресича.
- При недостъпен/липсващ feed сайтът пада грациозно към текст „Наличността се
  потвърждава от домакина" — резервацията все пак може да се изпрати, домакинът потвърждава
  ръчно.
- **Фаза 2 (TODO):** обратен iCal export от този сайт към Booking.com, за да не се налага
  ръчно отбелязване от две страни.

## Технологии

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · TypeScript · Resend ·
node-ical · Zod · date-fns · lucide-react

## Полезни команди

```bash
npm run dev      # dev сървър
npm run build    # production build
npm run lint     # ESLint
```
