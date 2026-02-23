# Vercel CLI - Инструкция по использованию

## Установка

Vercel CLI уже добавлен в `devDependencies`. Установите зависимости:

```bash
npm install
```

## Первоначальная настройка

### 1. Войдите в Vercel

```bash
npm run vercel:link
# или
npx vercel login
```

### 2. Привяжите проект к Vercel

```bash
npm run vercel:link
# или
npx vercel link
```

Выберите:
- Set up and develop? **Y**
- Which scope? Выберите ваш аккаунт
- Link to existing project? **Y** (если проект уже создан на Vercel)
- What's the name of your existing project? Введите название проекта

## Основные команды

### Разработка локально с Vercel

```bash
npm run vercel:dev
# или
npx vercel dev
```

Запускает локальный сервер с окружением Vercel (переменные окружения, edge functions и т.д.)

### Деплой на Preview

```bash
npm run vercel
# или
npx vercel
```

Создает preview deployment (для тестирования перед продакшеном)

### Деплой на Production

```bash
npm run vercel:prod
# или
npx vercel --prod
```

Деплоит на production окружение

### Работа с переменными окружения

#### Получить переменные из Vercel

```bash
npm run vercel:env:pull
# или
npx vercel env pull .env.production
```

Скачивает все переменные окружения в файл `.env.production`

#### Загрузить переменные в Vercel

```bash
npm run vercel:env:push
# или
npx vercel env push
```

Загружает переменные из `.env.local` в Vercel

#### Просмотр переменных

```bash
npx vercel env ls
```

#### Добавление переменной

```bash
npx vercel env add DATABASE_URL
```

### Просмотр логов

```bash
npm run vercel:logs
# или
npx vercel logs
```

Просмотр логов в реальном времени:

```bash
npx vercel logs --follow
```

### Выполнение миграций базы данных

После получения переменных окружения:

```bash
# 1. Получить переменные
npm run vercel:env:pull

# 2. Выполнить миграции
npx prisma migrate deploy

# 3. Заполнить начальными данными
npm run db:seed
```

## Полезные команды

### Просмотр информации о проекте

```bash
npx vercel inspect
```

### Просмотр всех деплоев

```bash
npx vercel ls
```

### Удаление деплоя

```bash
npx vercel remove [deployment-url]
```

### Просмотр доменов

```bash
npx vercel domains ls
```

## Примеры использования

### Полная настройка после первого деплоя

```bash
# 1. Войти в Vercel
npx vercel login

# 2. Привязать проект
npx vercel link

# 3. Получить переменные окружения
npm run vercel:env:pull

# 4. Выполнить миграции
npx prisma migrate deploy

# 5. Заполнить начальными данными
npm run db:seed
```

### Быстрый деплой изменений

```bash
# Деплой на preview
npm run vercel

# Если все ок, деплой на production
npm run vercel:prod
```

### Отладка проблем

```bash
# Просмотр логов
npm run vercel:logs

# Проверка переменных окружения
npx vercel env ls

# Локальная разработка с окружением Vercel
npm run vercel:dev
```

## Дополнительная информация

- [Документация Vercel CLI](https://vercel.com/docs/cli)
- [Команды Vercel CLI](https://vercel.com/docs/cli/commands)
