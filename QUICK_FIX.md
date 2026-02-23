# Быстрое исправление DATABASE_URL

## Проблема
База данных недоступна из Vercel.

## Решение

В Vercel (Settings → Environment Variables) установите:

**Key:** `DATABASE_URL`  
**Value:** 
```
postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**Environment:** Production, Preview, Development (все три)

## После обновления

1. Сохраните переменную
2. Перейдите в Deployments
3. Нажмите на последний деплой → три точки → Redeploy
4. Дождитесь завершения деплоя
5. Попробуйте зарегистрироваться снова

## Проверка

Откройте: `https://your-app.vercel.app/api/health`

Должен вернуться: `{"status":"ok","database":"connected"}`
