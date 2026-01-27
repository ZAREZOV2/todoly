# Финальная настройка DATABASE_URL

## Новые данные базы данных

**Пароль:** `UkdoL7NwIjQGMaOH`  
**URL шаблон:** `postgresql://postgres.ljhkywrprytafjddkbkc:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:5432/postgres`

## Правильный DATABASE_URL для Vercel

В настройках Vercel (Settings → Environment Variables) установите:

**Key:** `DATABASE_URL`  
**Value:**
```
postgresql://postgres.ljhkywrprytafjddkbkc:UkdoL7NwIjQGMaOH@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

## Важно

1. Используйте **postgresql://** (не postgres://)
2. Пароль: `UkdoL7NwIjQGMaOH` (без пробелов)
3. Хост: `aws-1-us-east-1.pooler.supabase.com`
4. Порт: `5432`

## Шаги

1. Откройте Vercel → Settings → Environment Variables
2. Найдите или создайте `DATABASE_URL`
3. Установите значение:
   ```
   postgresql://postgres:Ou0CXqYUNjcfoQ9M@db.ljhkywrprytafjddkbkc.supabase.co:5432/postgres?sslmode=require
   ```
4. Убедитесь, что выбраны все окружения (Production, Preview, Development)
5. Сохраните
6. Сделайте **Redeploy** проекта

## Проверка

После деплоя:
1. Проверьте: `https://your-app.vercel.app/api/db-check`
2. Проверьте: `https://your-app.vercel.app/api/health`
3. Попробуйте зарегистрироваться

## Если прямой хост не работает

Если `db.ljhkywrprytafjddkbkc.supabase.co:5432` недоступен из Vercel, используйте pooler URL:

```
postgresql://postgres.ljhkywrprytafjddkbkc:Ou0CXqYUNjcfoQ9M@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

Или проверьте в Supabase Dashboard → Settings → Database → Connection Pooling для правильного pooler URL.
