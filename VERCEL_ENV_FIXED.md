# Исправленные переменные окружения для Vercel

## Проблема
В URL базы данных есть специальные символы, которые нужно правильно экранировать.

## Правильные переменные окружения

### DATABASE_URL (ОБЯЗАТЕЛЬНО)

Используйте **POSTGRES_URL_NON_POOLING** для миграций и **POSTGRES_PRISMA_URL** для приложения:

**Для DATABASE_URL в Vercel используйте:**
```
postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**ИЛИ лучше используйте прямой URL (без pooler):**
```
postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@db.ljhkywrprytafjddkbkc.supabase.co:5432/postgres?sslmode=require
```

**ИЛИ с экранированием пароля (если есть проблемы):**
Если пароль содержит специальные символы, закодируйте их:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

В вашем случае пароль `2x3sN47tNO8ep1mp` не содержит специальных символов, но если проблема сохраняется, попробуйте:

```
postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@db.ljhkywrprytafjddkbkc.supabase.co:5432/postgres?sslmode=require
```

### NEXTAUTH_SECRET
```
PxCzoV9rQx7bmqxuj0d8hDfb3Xpd3J06YlBqlAUu6cHJc2kz5dpDODFBoSktbR//QqyWlhvIInPlUk71bq8R9w==
```

### NEXTAUTH_URL
```
https://your-app-name.vercel.app
```
(Будет установлен автоматически Vercel)

## Рекомендуемый формат для Supabase

Для Supabase лучше использовать прямой connection string без pooler для Prisma:

```
postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@db.ljhkywrprytafjddkbkc.supabase.co:5432/postgres?sslmode=require
```

Где:
- `postgres.ljhkywrprytafjddkbkc` - пользователь
- `2x3sN47tNO8ep1mp` - пароль
- `db.ljhkywrprytafjddkbkc.supabase.co` - хост
- `5432` - порт (не 6543!)
- `postgres` - имя базы данных

## Проверка подключения

После добавления переменных, проверьте подключение:

```bash
vercel env pull .env.production
npx prisma db push
```

Если ошибка сохраняется, попробуйте использовать URL из `POSTGRES_URL_NON_POOLING`:
```
postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```
