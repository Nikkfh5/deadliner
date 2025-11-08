import { useState } from "react";
import { format, parseISO, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PeriodCalendar({ summaries, onEditProgress, onDeleteProgress }) {
  const [selectedGoalId, setSelectedGoalId] = useState(summaries[0]?.goal.id || "");

  const selectedSummary = summaries.find(s => s.goal.id === selectedGoalId);

  if (!selectedSummary) {
    return <div className="text-muted-foreground">Выберите цель</div>;
  }

  const { goal, progress_entries } = selectedSummary;
  const startDate = parseISO(goal.start_date);
  const endDate = parseISO(goal.end_date);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayOfWeekName = (date) => {
    const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return dayNames[getDay(date)];
  };

  const getProgressForDay = (date) => {
    return progress_entries.filter(p => isSameDay(parseISO(p.date), date));
  };

  const isFullDay = (progressList) => {
    return progressList.some(p => p.value >= 1 && goal.measure_type === "full_days");
  };

  const getTotalHours = (progressList) => {
    return progressList.reduce((sum, p) => sum + p.value, 0);
  };

  return (
    <div className="space-y-4" data-testid="period-calendar">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Выберите цель:</label>
        <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
          <SelectTrigger className="w-64" data-testid="calendar-goal-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {summaries.map((summary) => (
              <SelectItem key={summary.goal.id} value={summary.goal.id}>
                {summary.goal.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Дата</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">День недели</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                {goal.measure_type === "full_days" ? "Фулл-день" : "Часы"}
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {days.map((day) => {
              const dayProgress = getProgressForDay(day);
              const hasProgress = dayProgress.length > 0;
              const isFullDayMarked = isFullDay(dayProgress);
              const totalHours = getTotalHours(dayProgress);

              return (
                <tr
                  key={day.toISOString()}
                  className="hover:bg-muted/50 transition-colors"
                  data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {format(day, "dd.MM.yyyy")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getDayOfWeekName(day)}
                  </td>
                  <td className="px-4 py-3">
                    {hasProgress && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" data-testid="day-completed-icon" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {hasProgress ? (
                      <div className="flex flex-col gap-1">
                        {goal.measure_type === "full_days" && isFullDayMarked && (
                          <Badge variant="default" className="w-fit" data-testid="full-day-badge">
                            Фулл-день
                          </Badge>
                        )}
                        {goal.measure_type === "hours" && totalHours > 0 && (
                          <Badge variant="secondary" className="w-fit" data-testid="hours-badge">
                            {totalHours.toFixed(1)} ч
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {dayProgress.length > 0 && (
                      <div className="flex gap-1">
                        {dayProgress.map((progress) => (
                          <div key={progress.id} className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onEditProgress(progress)}
                              data-testid={`edit-progress-${progress.id}`}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onDeleteProgress(progress.id)}
                              data-testid={`delete-progress-${progress.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}