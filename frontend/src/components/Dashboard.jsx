import { useState, useEffect } from "react";
import axios from "axios";
import { Moon, Sun, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import GoalForm from "@/components/GoalForm";
import ProgressForm from "@/components/ProgressForm";
import GoalsSummary from "@/components/GoalsSummary";
import PeriodCalendar from "@/components/PeriodCalendar";
import RemainingGoals from "@/components/RemainingGoals";
import { toast } from "sonner";

export default function Dashboard({ api }) {
  const { theme, setTheme } = useTheme();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingProgress, setEditingProgress] = useState(null);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api}/summary`);
      setSummaries(response.data);
    } catch (error) {
      console.error("Error fetching summaries:", error);
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleGoalCreated = () => {
    setShowGoalForm(false);
    setEditingGoal(null);
    fetchSummaries();
    toast.success("Цель успешно сохранена");
  };

  const handleProgressCreated = () => {
    setShowProgressForm(false);
    setEditingProgress(null);
    fetchSummaries();
    toast.success("Прогресс успешно добавлен");
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowGoalForm(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Удалить эту цель и весь связанный прогресс?")) return;
    
    try {
      await axios.delete(`${api}/goals/${goalId}`);
      fetchSummaries();
      toast.success("Цель удалена");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Ошибка удаления цели");
    }
  };

  const handleEditProgress = (progress) => {
    setEditingProgress(progress);
    setShowProgressForm(true);
  };

  const handleDeleteProgress = async (progressId) => {
    if (!window.confirm("Удалить эту отметку прогресса?")) return;
    
    try {
      await axios.delete(`${api}/progress/${progressId}`);
      fetchSummaries();
      toast.success("Отметка удалена");
    } catch (error) {
      console.error("Error deleting progress:", error);
      toast.error("Ошибка удаления отметки");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Дедлайник</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              data-testid="add-goal-button"
              onClick={() => {
                setEditingGoal(null);
                setShowGoalForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Новая цель
            </Button>
            <Button
              variant="outline"
              size="sm"
              data-testid="add-progress-button"
              onClick={() => {
                setEditingProgress(null);
                setShowProgressForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Отметить прогресс
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-testid="theme-toggle-button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64" data-testid="loading-indicator">
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Goals Summary */}
            <Card data-testid="goals-summary-card">
              <CardHeader>
                <CardTitle>Сводка по целям</CardTitle>
                <CardDescription>Ваши цели и прогресс по ним</CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsSummary
                  summaries={summaries}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                />
              </CardContent>
            </Card>

            {/* Calendar View */}
            {summaries.length > 0 && (
              <Card data-testid="calendar-card">
                <CardHeader>
                  <CardTitle>Календарь периода</CardTitle>
                  <CardDescription>Разметка дней по активностям</CardDescription>
                </CardHeader>
                <CardContent>
                  <PeriodCalendar
                    summaries={summaries}
                    onEditProgress={handleEditProgress}
                    onDeleteProgress={handleDeleteProgress}
                  />
                </CardContent>
              </Card>
            )}

            {/* Remaining Goals */}
            {summaries.length > 0 && (
              <Card data-testid="remaining-goals-card">
                <CardHeader>
                  <CardTitle>Остаток по целям</CardTitle>
                  <CardDescription>Что ещё нужно выполнить</CardDescription>
                </CardHeader>
                <CardContent>
                  <RemainingGoals summaries={summaries} />
                </CardContent>
              </Card>
            )}

            {summaries.length === 0 && (
              <div className="text-center py-16" data-testid="empty-state">
                <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Нет целей</h3>
                <p className="text-muted-foreground mb-6">Начните с добавления первой цели</p>
                <Button onClick={() => setShowGoalForm(true)} data-testid="empty-state-add-goal-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить цель
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <GoalForm
        open={showGoalForm}
        onClose={() => {
          setShowGoalForm(false);
          setEditingGoal(null);
        }}
        onSuccess={handleGoalCreated}
        api={api}
        editingGoal={editingGoal}
      />

      <ProgressForm
        open={showProgressForm}
        onClose={() => {
          setShowProgressForm(false);
          setEditingProgress(null);
        }}
        onSuccess={handleProgressCreated}
        api={api}
        summaries={summaries}
        editingProgress={editingProgress}
      />
    </div>
  );
}