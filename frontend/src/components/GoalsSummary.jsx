import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export default function GoalsSummary({ summaries, onEdit, onDelete }) {
  const getPeriodLabel = (goal) => {
    const start = format(parseISO(goal.start_date), "d MMM", { locale: ru });
    const end = format(parseISO(goal.end_date), "d MMM yyyy", { locale: ru });
    return `${start} — ${end}`;
  };

  const getMeasureLabel = (measureType) => {
    return measureType === "full_days" ? "Фулл-дни" : "Часы";
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return "text-green-600 dark:text-green-400";
    if (percentage >= 70) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (summaries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="no-goals-message">
        Цели пока не добавлены
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="goals-summary-list">
      {summaries.map((summary) => (
        <div
          key={summary.goal.id}
          className="border border-border rounded-lg p-4 space-y-3 bg-card hover:shadow-md transition-shadow"
          data-testid={`goal-summary-${summary.goal.id}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-foreground" data-testid="goal-name">
                  {summary.goal.name}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground" data-testid="goal-period">
                  {getPeriodLabel(summary.goal)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground" data-testid="goal-measure">
                {getMeasureLabel(summary.goal.measure_type)}: {summary.completed.toFixed(1)} из {summary.goal.target_value}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(summary.goal)}
                data-testid={`edit-goal-${summary.goal.id}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(summary.goal.id)}
                data-testid={`delete-goal-${summary.goal.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Прогресс</span>
              <span className={`font-semibold ${getStatusColor(summary.percentage)}`} data-testid="goal-percentage">
                {summary.percentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={summary.percentage} className="h-2" data-testid="goal-progress-bar" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Цель</p>
              <p className="text-sm font-medium text-foreground" data-testid="goal-target">
                {summary.goal.target_value}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Выполнено</p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400" data-testid="goal-completed">
                {summary.completed.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Осталось</p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400" data-testid="goal-remaining">
                {summary.remaining.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}