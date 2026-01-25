# Настройка Supabase через Vercel Integration

Если вы подключили Supabase Storage напрямую к проекту в Vercel, переменные окружения уже должны быть добавлены автоматически.

## Проверка переменных в Vercel

1. Откройте Vercel → Settings → Environment Variables
2. Найдите переменные с префиксом `STORAGE_` или `SUPABASE_`

## Используйте правильную переменную для DATABASE_URL

Если Supabase подключен через интеграцию, используйте одну из этих переменных:

### Вариант 1: POSTGRES_PRISMA_URL (если есть)
```
DATABASE_URL = значение из POSTGRES_PRISMA_URL
```

### Вариант 2: POSTGRES_URL (если есть)
```
DATABASE_URL = значение из POSTGRES_URL
```

### Вариант 3: POSTGRES_URL_NON_POOLING (если есть)
```
DATABASE_URL = значение из POSTGRES_URL_NON_POOLING
```

## Если переменных нет, добавьте вручную

Если Supabase Storage подключен, но переменных для базы данных нет, добавьте:

**Key:** `DATABASE_URL`  
**Value:** Используйте значение из вашего Supabase проекта:
- Откройте Supabase Dashboard
- Settings → Database
- Connection String → Connection Pooling
- Скопируйте "Connection string" (URI mode)

Он должен выглядеть так:
```
postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

## Проверка подключения

После настройки проверьте:
1. Health endpoint: `https://your-app.vercel.app/api/health`
2. Попробуйте зарегистрироваться
