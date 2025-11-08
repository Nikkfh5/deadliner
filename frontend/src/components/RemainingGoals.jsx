import { format, parseISO, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, TrendingUp } from "lucide-react";

export default function RemainingGoals({ summaries }) {
  const getMeasureLabel = (measureType) => {
    return measureType === "full_days" ? "фулл-дней" : "часов";
  };

  const getDaysRemaining = (endDate) => {
    const end = parseISO(endDate);
    const today = new Date();
    const days = differenceInDays(end, today);
    return days >= 0 ? days : 0;
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 100) return <Target className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (percentage >= 70) return <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
  };

  const getStatusText = (percentage, remaining) => {
    if (percentage >= 100) return "Цель достигнута";
    if (remaining === 0) return "Нет оставшихся задач";
    return `Осталось выполнить`;
  };

  return (
    <div className="space-y-4" data-testid="remaining-goals-list">
      {summaries.map((summary) => {
        const daysLeft = getDaysRemaining(summary.goal.end_date);
        const statusText = getStatusText(summary.percentage, summary.remaining);

        return (
          <div
            key={summary.goal.id}
            className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
            data-testid={`remaining-goal-${summary.goal.id}`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">{getStatusIcon(summary.percentage)}</div>
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-semibold text-foreground mb-1" data-testid="remaining-goal-name">
                    {summary.goal.name}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid="remaining-goal-period">
                    {format(parseISO(summary.goal.start_date), "d MMM", { locale: ru })} —{" "}
                    {format(parseISO(summary.goal.end_date), "d MMM yyyy", { locale: ru })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Выполнено</p>
                    <p className="font-medium text-foreground" data-testid="remaining-goal-completed">
                      {summary.completed.toFixed(1)} из {summary.goal.target_value} {getMeasureLabel(summary.goal.measure_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Дней до конца</p>
                    <p className="font-medium text-foreground" data-testid="remaining-goal-days-left">
                      {daysLeft} {daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{statusText}</span>
                    {summary.remaining > 0 && (
                      <span className="font-semibold text-blue-600 dark:text-blue-400" data-testid="remaining-goal-value">
                        {summary.remaining.toFixed(1)} {getMeasureLabel(summary.goal.measure_type)}
                      </span>
                    )}
                  </div>
                  <Progress value={summary.percentage} className="h-2" data-testid="remaining-goal-progress-bar" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}