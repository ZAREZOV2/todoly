# Исправление DATABASE_URL для Vercel

## Проблема
Прямой хост Supabase недоступен из Vercel. Нужно использовать pooler URL.

## Решение - Используйте POSTGRES_PRISMA_URL

В настройках Vercel (Settings → Environment Variables) используйте **POSTGRES_PRISMA_URL** из ваших данных Supabase:

```
DATABASE_URL=postgresql://postgres.ljhkywrprytafjddkbkc:UkdoL7NwIjQGMaOH@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

Это специальный URL для Prisma, который использует connection pooler Supabase.

## Альтернативный вариант (если первый не работает)

Попробуйте POSTGRES_URL (тоже с pooler):

```
DATABASE_URL=postgresql://postgres.ljhkywrprytafjddkbkc:UkdoL7NwIjQGMaOH@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

## Важно

1. **Используйте pooler URL** (порт 6543) для подключения из Vercel
2. **Добавьте параметр `pgbouncer=true`** для правильной работы с Prisma
3. **НЕ используйте прямой хост** `db.ljhkywrprytafjddkbkc.supabase.co` - он недоступен из внешних сервисов

## Шаги для исправления

1. Откройте Vercel → Settings → Environment Variables
2. Найдите или создайте `DATABASE_URL`
3. Установите значение:
   ```
   postgresql://postgres.ljhkywrprytafjddkbkc:UkdoL7NwIjQGMaOH@aws-1-us-east-1.pooler.supabase.com:5432/postgres
   ```
4. Убедитесь, что выбраны все окружения (Production, Preview, Development)
5. Сохраните
6. Сделайте **Redeploy** проекта

## Проверка подключения

После обновления проверьте:
- Health endpoint: `https://your-app.vercel.app/api/health`
- Попробуйте зарегистрироваться снова

## Если проблема сохраняется

1. Проверьте, что база данных Supabase активна
2. Убедитесь, что в настройках Supabase разрешены подключения из внешних источников
3. Проверьте, что пароль правильный (без лишних пробелов)
