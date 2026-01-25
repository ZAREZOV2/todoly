# Исправление DATABASE_URL для Vercel

## Проблема
Prisma не может распарсить connection string из-за недопустимых символов или неправильного формата.

## Решение

В настройках Vercel (Settings → Environment Variables) используйте **один из этих вариантов**:

### Вариант 1: Прямой URL без pooler (РЕКОМЕНДУЕТСЯ для Prisma)

```
DATABASE_URL=postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@db.ljhkywrprytafjddkbkc.supabase.co:5432/postgres?sslmode=require
```

### Вариант 2: POSTGRES_URL_NON_POOLING (из ваших данных)

```
DATABASE_URL=postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### Вариант 3: Если пароль содержит специальные символы

Если в пароле есть `@`, `#`, `$`, `%`, `&`, `+`, `=` и т.д., закодируйте их в URL:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

## Важно

1. **НЕ используйте pooler URL (порт 6543) для Prisma** - используйте прямой порт 5432
2. **Убедитесь, что нет лишних пробелов** в начале или конце значения
3. **Используйте `POSTGRES_URL_NON_POOLING`** из ваших данных Supabase

## Проверка

После обновления переменной:

1. Сделайте **Redeploy** в Vercel
2. Проверьте health endpoint: `https://your-app.vercel.app/api/health`
3. Попробуйте зарегистрироваться снова

## Формат правильного URL

```
postgres://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?[PARAMS]
```

Где:
- `[USER]` = `postgres.ljhkywrprytafjddkbkc`
- `[PASSWORD]` = `2x3sN47tNO8ep1mp` (без экранирования, если нет спецсимволов)
- `[HOST]` = `db.ljhkywrprytafjddkbkc.supabase.co` (или `aws-1-us-east-1.pooler.supabase.com`)
- `[PORT]` = `5432` (НЕ 6543 для Prisma!)
- `[DATABASE]` = `postgres`
- `[PARAMS]` = `sslmode=require`
