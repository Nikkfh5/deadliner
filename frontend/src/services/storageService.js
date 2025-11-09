// Сервис для работы с localStorage вместо backend API

// Генерация UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Получение данных из localStorage
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return [];
  }
};

// Сохранение данных в localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage: ${key}`, error);
  }
};

// Ключи для хранения
const GOALS_KEY = 'deadliner_goals';
const PROGRESS_KEY = 'deadliner_progress';

// API для целей
export const goalsAPI = {
  // Создать цель
  create: async (goalData) => {
    const goals = getFromStorage(GOALS_KEY);
    const newGoal = {
      id: generateId(),
      ...goalData,
      created_at: new Date().toISOString()
    };
    goals.push(newGoal);
    saveToStorage(GOALS_KEY, goals);
    return { data: newGoal };
  },

  // Получить все цели
  getAll: async () => {
    const goals = getFromStorage(GOALS_KEY);
    return { data: goals };
  },

  // Получить одну цель
  getOne: async (goalId) => {
    const goals = getFromStorage(GOALS_KEY);
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }
    return { data: goal };
  },

  // Обновить цель
  update: async (goalId, updates) => {
    const goals = getFromStorage(GOALS_KEY);
    const index = goals.findIndex(g => g.id === goalId);
    if (index === -1) {
      throw new Error('Goal not found');
    }
    goals[index] = { ...goals[index], ...updates };
    saveToStorage(GOALS_KEY, goals);
    return { data: goals[index] };
  },

  // Удалить цель
  delete: async (goalId) => {
    const goals = getFromStorage(GOALS_KEY);
    const filtered = goals.filter(g => g.id !== goalId);
    saveToStorage(GOALS_KEY, filtered);
    
    // Также удаляем весь связанный прогресс
    const progress = getFromStorage(PROGRESS_KEY);
    const filteredProgress = progress.filter(p => p.goal_id !== goalId);
    saveToStorage(PROGRESS_KEY, filteredProgress);
    
    return { data: { message: 'Goal deleted successfully' } };
  }
};

// API для прогресса
export const progressAPI = {
  // Создать прогресс
  create: async (progressData) => {
    const progress = getFromStorage(PROGRESS_KEY);
    const newProgress = {
      id: generateId(),
      ...progressData,
      created_at: new Date().toISOString()
    };
    progress.push(newProgress);
    saveToStorage(PROGRESS_KEY, progress);
    return { data: newProgress };
  },

  // Получить весь прогресс (с фильтром по goal_id)
  getAll: async (goalId = null) => {
    let progress = getFromStorage(PROGRESS_KEY);
    if (goalId) {
      progress = progress.filter(p => p.goal_id === goalId);
    }
    return { data: progress };
  },

  // Получить одну запись прогресса
  getOne: async (progressId) => {
    const progress = getFromStorage(PROGRESS_KEY);
    const entry = progress.find(p => p.id === progressId);
    if (!entry) {
      throw new Error('Progress entry not found');
    }
    return { data: entry };
  },

  // Обновить прогресс
  update: async (progressId, updates) => {
    const progress = getFromStorage(PROGRESS_KEY);
    const index = progress.findIndex(p => p.id === progressId);
    if (index === -1) {
      throw new Error('Progress entry not found');
    }
    progress[index] = { ...progress[index], ...updates };
    saveToStorage(PROGRESS_KEY, progress);
    return { data: progress[index] };
  },

  // Удалить прогресс
  delete: async (progressId) => {
    const progress = getFromStorage(PROGRESS_KEY);
    const filtered = progress.filter(p => p.id !== progressId);
    saveToStorage(PROGRESS_KEY, filtered);
    return { data: { message: 'Progress entry deleted successfully' } };
  }
};

// API для сводки
export const summaryAPI = {
  // Получить сводку по всем целям
  getAll: async () => {
    const goals = getFromStorage(GOALS_KEY);
    const allProgress = getFromStorage(PROGRESS_KEY);
    
    const summaries = goals.map(goal => {
      const progressEntries = allProgress.filter(p => p.goal_id === goal.id);
      const completed = progressEntries.reduce((sum, p) => sum + p.value, 0);
      const remaining = Math.max(0, goal.target_value - completed);
      const percentage = goal.target_value > 0 ? (completed / goal.target_value * 100) : 0;
      
      return {
        goal,
        completed,
        remaining,
        percentage: Math.min(100, percentage),
        progress_entries: progressEntries
      };
    });
    
    return { data: summaries };
  }
};

const storageService = {
  goals: goalsAPI,
  progress: progressAPI,
  summary: summaryAPI
};

export default storageService;