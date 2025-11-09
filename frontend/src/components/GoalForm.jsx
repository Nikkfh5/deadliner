import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ru } from "date-fns/locale";
import storageService from "@/services/storageService";

export default function GoalForm({ open, onClose, onSuccess, editingGoal }) {
  const [formData, setFormData] = useState({
    name: "",
    period_type: "week",
    start_date: "",
    end_date: "",
    measure_type: "full_days",
    target_value: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        name: editingGoal.name,
        period_type: editingGoal.period_type,
        start_date: editingGoal.start_date,
        end_date: editingGoal.end_date,
        measure_type: editingGoal.measure_type,
        target_value: editingGoal.target_value.toString(),
      });
    } else {
      // Auto-set dates based on period type
      const today = new Date();
      if (formData.period_type === "week") {
        setFormData(prev => ({
          ...prev,
          start_date: format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
          end_date: format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        }));
      } else if (formData.period_type === "month") {
        setFormData(prev => ({
          ...prev,
          start_date: format(startOfMonth(today), "yyyy-MM-dd"),
          end_date: format(endOfMonth(today), "yyyy-MM-dd"),
        }));
      }
    }
  }, [editingGoal, formData.period_type, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.end_date || !formData.target_value) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        target_value: parseFloat(formData.target_value),
      };

      if (editingGoal) {
        await storageService.goals.update(editingGoal.id, payload);
      } else {
        await storageService.goals.create(payload);
      }

      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Ошибка сохранения цели");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      period_type: "week",
      start_date: "",
      end_date: "",
      measure_type: "full_days",
      target_value: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="goal-form-dialog">
        <DialogHeader>
          <DialogTitle>{editingGoal ? "Редактировать цель" : "Новая цель"}</DialogTitle>
          <DialogDescription>
            Задайте параметры цели: период, активность и целевое значение
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название активности</Label>
            <Input
              id="name"
              data-testid="goal-name-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: диплом, АКОС, спорт"
            />
          </div>

          <div>
            <Label htmlFor="period_type">Тип периода</Label>
            <Select
              value={formData.period_type}
              onValueChange={(value) => setFormData({ ...formData, period_type: value })}
            >
              <SelectTrigger data-testid="period-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="custom">Произвольный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Начало периода</Label>
              <Input
                id="start_date"
                type="date"
                data-testid="start-date-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Конец периода</Label>
              <Input
                id="end_date"
                type="date"
                data-testid="end-date-input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="measure_type">Мера</Label>
            <Select
              value={formData.measure_type}
              onValueChange={(value) => setFormData({ ...formData, measure_type: value })}
            >
              <SelectTrigger data-testid="measure-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_days">Фулл-дни</SelectItem>
                <SelectItem value="hours">Часы</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="target_value">
              Целевое значение ({formData.measure_type === "full_days" ? "дней" : "часов"})
            </Label>
            <Input
              id="target_value"
              type="number"
              step="0.5"
              data-testid="target-value-input"
              value={formData.target_value}
              onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
              placeholder="Например: 8"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="cancel-goal-button">
              Отмена
            </Button>
            <Button type="submit" disabled={loading} data-testid="save-goal-button">
              {loading ? "Сохранение..." : editingGoal ? "Обновить" : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}