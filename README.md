Production-ready MVP на **Next.js 14 + TypeScript + Tailwind + Supabase**.

## Возможности
- Public home: Live Market Feed (open tasks only, only tasks with budget/fixed-range-collab).
- Magic link auth (Supabase).
- Onboarding: роль, город, теги, контакты.
- Профиль `/me` + trust score (RPC).
- Tasks CRUD-lite: лента, фильтры, создание задачи с обязательным бюджетом.
- Offers: отклик, принятие, открытие контактов только после accept.
- Completion + disputes + reviews (1–5 + flags).
- Supabase schema + RLS policies.
- Seed script: 30 profiles + 20 tasks.

## Структура папок

```text
app/
  (auth)/login/page.tsx
  (auth)/onboarding/page.tsx
  api/
    auth/callback/route.ts
    tasks/route.ts
    tasks/[id]/status/route.ts
    offers/route.ts
    offers/[id]/accept/route.ts
    reviews/route.ts
  me/page.tsx
  tasks/page.tsx
  tasks/new/page.tsx
  tasks/[id]/page.tsx
  layout.tsx
  page.tsx
components/
  task-card.tsx
  task-filters.tsx
  ui.tsx
lib/
  supabase-browser.ts
  supabase-server.ts
  supabase-admin.ts
  validators.ts
  utils.ts
  types.ts
scripts/
  seeds.ts
supabase/migrations/
  0001_init.sql
```

## Локальный запуск

1. Установить зависимости:
   ```bash
   npm install
   ```
2. Скопировать окружение:
   ```bash
   cp .env.example .env.local
   ```
3. Создать проект Supabase и применить `supabase/migrations/0001_init.sql` (через SQL editor).
4. Запустить dev:
   ```bash
   npm run dev
   ```
5. (Опционально) наполнить demo данными:
   ```bash
   npm run seed
   ```

## Deploy на Vercel
1. Import Git repo в Vercel.
2. Build command: `npm run build`, Output: `.next`.
3. Добавить env-переменные из `.env.example`.
4. Deploy.

## Deploy на Cloudflare Pages
1. Создать Pages project и подключить репозиторий.
2. Build command: `npm run build`.
3. Использовать Next.js adapter через Pages integration.
4. Добавить env-переменные Supabase.

## Масштаб и ограничения MVP
- Расчет на 100–1000 пользователей.
- Без внутреннего чата.
- Контакты исполнителя доступны только после принятия отклика.
- Задача публикуется только при валидном бюджете (fixed/range/collab).
