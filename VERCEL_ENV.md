# Переменные окружения для Vercel

Добавьте следующие переменные окружения в настройках проекта Vercel (Settings → Environment Variables):

## Обязательные переменные

### База данных
```
DATABASE_URL=postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**Или используйте POSTGRES_PRISMA_URL для лучшей совместимости:**
```
DATABASE_URL=postgres://postgres.ljhkywrprytafjddkbkc:2x3sN47tNO8ep1mp@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

### NextAuth
```
NEXTAUTH_SECRET=PxCzoV9rQx7bmqxuj0d8hDfb3Xpd3J06YlBqlAUu6cHJc2kz5dpDODFBoSktbR//QqyWlhvIInPlUk71bq8R9w==
```

**Или сгенерируйте новый:**
```bash
openssl rand -base64 32
```

### URL приложения
```
NEXTAUTH_URL=https://your-app-name.vercel.app
```

Vercel автоматически установит это значение, но можно указать вручную.

## Опциональные переменные (для будущего использования Supabase Auth)

Если в будущем захотите использовать Supabase Auth вместо NextAuth:

```
NEXT_PUBLIC_SUPABASE_URL=https://ljhkywrprytafjddkbkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqaGt5d3Jwcnl0YWZqZGRrYmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDEzNDQsImV4cCI6MjA4NDg3NzM0NH0.gh370L1CgwxSsAVxa06gW4s9kB0tAZ1yuJWnVB99XL0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqaGt5d3Jwcnl0YWZqZGRrYmtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMwMTM0NCwiZXhwIjoyMDg0ODc3MzQ0fQ.vSpmMWm1h6cs7zqtPeqoQtBjlSK-Q9NNuryzmrsMOGs
```

## Инструкция по добавлению в Vercel

1. Перейдите в ваш проект на Vercel
2. Откройте **Settings** → **Environment Variables**
3. Добавьте каждую переменную:
   - **Key**: имя переменной (например, `DATABASE_URL`)
   - **Value**: значение переменной
   - **Environment**: выберите `Production`, `Preview`, и `Development` (или только нужные)
4. Нажмите **Save**
5. После добавления всех переменных, перейдите в **Deployments** и сделайте **Redeploy** последнего деплоя

## После добавления переменных

1. Выполните миграции базы данных:
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

2. Заполните начальными данными:
   ```bash
   npx prisma db seed
   ```

3. Или добавьте в Build Command в Vercel:
   ```
   prisma generate && prisma migrate deploy && npm run build
   ```

## Важно

- **Не коммитьте** эти значения в git (они уже в .gitignore)
- Используйте **POSTGRES_PRISMA_URL** или **POSTGRES_URL** для `DATABASE_URL`
- Для продакшена используйте **NEXTAUTH_SECRET** из Supabase или сгенерируйте новый
- **NEXTAUTH_URL** будет автоматически установлен Vercel, но можно указать вручную
