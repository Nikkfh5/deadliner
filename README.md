# Дедлайник

Персональный трекер целей и прогресса для эффективного планирования и отслеживания выполнения задач.

## Описание

Дедлайник помогает размечать недели и месяцы под цели и считать, сколько ещё осталось фулл-дней или часов по каждому типу активности. Приложение предоставляет три основных блока визуализации:

1. **Сводка по целям** — таблица с целями, прогресс-барами и процентами выполнения
2. **Календарь периода** — разметка дней с галочками и метками активностей
3. **Остаток по целям** — детальная информация о том, что ещё нужно выполнить

## Возможности

- ✅ Создание целей с периодами (неделя/месяц/произвольный диапазон)
- ✅ Выбор меры измерения: фулл-дни или часы
- ✅ Отметки прогресса с указанием даты и значения
- ✅ Редактирование и удаление целей/прогресса
- ✅ Визуальные индикаторы: прогресс-бары, цветовые статусы
- ✅ Переключение светлой/тёмной темы
- ✅ Минималистичный деловой дизайн

## Технологии

**Backend:**
- FastAPI
- MongoDB
- Motor (async MongoDB driver)
- Pydantic

**Frontend:**
- React 19
- Tailwind CSS
- Shadcn UI компоненты
- Axios
- date-fns
- next-themes

## Требования

- Python 3.11+
- Node.js 18+
- MongoDB
- Yarn

## Установка

### 1. Клонирование репозитория

```bash
git clone <ваш-репозиторий>
cd deadliner
```

### 2. Установка зависимостей Backend

```bash
cd backend
pip install -r requirements.txt
```

### 3. Установка зависимостей Frontend

```bash
cd frontend
yarn install
```

### 4. Настройка переменных окружения

**Backend (.env в папке /backend):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=deadliner_db
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env в папке /frontend):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 5. Запуск MongoDB

Убедитесь, что MongoDB запущен на вашем компьютере:

```bash
# MacOS (через Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
# Запустите MongoDB через Services или напрямую mongod.exe
```

## Запуск приложения

### Вариант 1: Ручной запуск

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

Приложение будет доступно по адресу: `http://localhost:3000`

### Вариант 2: Использование Supervisor (Linux/MacOS)

Если у вас установлен supervisor, можете использовать конфигурацию для автоматического запуска сервисов.

## Структура проекта

```
/
├── backend/
│   ├── server.py           # Главный файл FastAPI приложения
│   ├── requirements.txt    # Python зависимости
│   └── .env               # Переменные окружения backend
│
├── frontend/
│   ├── public/            # Статические файлы
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   │   ├── ui/       # Shadcn UI компоненты
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GoalForm.jsx
│   │   │   ├── ProgressForm.jsx
│   │   │   ├── GoalsSummary.jsx
│   │   │   ├── PeriodCalendar.jsx
│   │   │   └── RemainingGoals.jsx
│   │   ├── App.js        # Главный компонент
│   │   ├── App.css       # Стили приложения
│   │   └── index.css     # Глобальные стили
│   ├── package.json      # Node.js зависимости
│   └── .env             # Переменные окружения frontend
│
└── README.md            # Этот файл
```

## API Endpoints

### Цели (Goals)

- `POST /api/goals` - Создать цель
- `GET /api/goals` - Получить все цели
- `GET /api/goals/{goal_id}` - Получить одну цель
- `PUT /api/goals/{goal_id}` - Обновить цель
- `DELETE /api/goals/{goal_id}` - Удалить цель

### Прогресс (Progress)

- `POST /api/progress` - Добавить прогресс
- `GET /api/progress` - Получить весь прогресс (с фильтром по goal_id)
- `GET /api/progress/{progress_id}` - Получить запись прогресса
- `PUT /api/progress/{progress_id}` - Обновить прогресс
- `DELETE /api/progress/{progress_id}` - Удалить прогресс

### Сводка

- `GET /api/summary` - Получить сводку по всем целям с прогрессом

## Использование

### Создание цели

1. Нажмите кнопку "Новая цель" в шапке приложения
2. Заполните форму:
   - Название активности (например: "Диплом", "АКОС", "Спорт")
   - Тип периода (неделя/месяц/произвольный)
   - Даты начала и конца
   - Мера (фулл-дни или часы)
   - Целевое значение
3. Нажмите "Создать"

### Отметка прогресса

1. Нажмите кнопку "Отметить прогресс" в шапке
2. Выберите цель из списка
3. Укажите дату (по умолчанию - сегодня)
4. Введите значение (количество дней или часов)
5. Опционально: добавьте заметку
6. Нажмите "Добавить"

### Редактирование

- Для редактирования цели нажмите на иконку карандаша в карточке цели
- Для редактирования прогресса найдите нужный день в календаре и нажмите на иконку карандаша

### Удаление

- Для удаления цели нажмите на иконку корзины (удалятся все связанные записи прогресса)
- Для удаления записи прогресса нажмите на иконку корзины в календаре

## Модели данных

### Goal (Цель)

```json
{
  "id": "uuid",
  "name": "Название активности",
  "period_type": "week|month|custom",
  "start_date": "2025-01-06",
  "end_date": "2025-01-12",
  "measure_type": "full_days|hours",
  "target_value": 8.0,
  "created_at": "2025-01-08T12:00:00Z"
}
```

### Progress (Прогресс)

```json
{
  "id": "uuid",
  "goal_id": "uuid",
  "date": "2025-01-06",
  "value": 1.0,
  "note": "Заметка",
  "created_at": "2025-01-08T12:00:00Z"
}
```

## Разработка

### Установка новых зависимостей

**Backend:**
```bash
pip install <package>
pip freeze > requirements.txt
```

**Frontend:**
```bash
yarn add <package>
```

### Добавление новых Shadcn UI компонентов

```bash
cd frontend
npx shadcn-ui@latest add <component-name>
```

## Лицензия

MIT

## Автор

Создано с помощью [Emergent](https://emergent.sh)
