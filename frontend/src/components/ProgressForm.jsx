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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import storageService from "@/services/storageService";

export default function ProgressForm({ open, onClose, onSuccess, summaries, editingProgress }) {
  const [formData, setFormData] = useState({
    goal_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    value: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    if (editingProgress) {
      setFormData({
        goal_id: editingProgress.goal_id,
        date: editingProgress.date,
        value: editingProgress.value.toString(),
        note: editingProgress.note || "",
      });
      const goal = summaries.find(s => s.goal.id === editingProgress.goal_id)?.goal;
      setSelectedGoal(goal);
    } else {
      setFormData(prev => ({
        ...prev,
        date: format(new Date(), "yyyy-MM-dd"),
      }));
    }
  }, [editingProgress, summaries, open]);

  useEffect(() => {
    if (formData.goal_id) {
      const goal = summaries.find(s => s.goal.id === formData.goal_id)?.goal;
      setSelectedGoal(goal);
    }
  }, [formData.goal_id, summaries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.goal_id || !formData.date || !formData.value) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
      };

      if (editingProgress) {
        await storageService.progress.update(editingProgress.id, payload);
      } else {
        await storageService.progress.create(payload);
      }

      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Ошибка сохранения прогресса");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      goal_id: "",
      date: format(new Date(), "yyyy-MM-dd"),
      value: "",
      note: "",
    });
    setSelectedGoal(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="progress-form-dialog">
        <DialogHeader>
          <DialogTitle>{editingProgress ? "Редактировать прогресс" : "Отметить прогресс"}</DialogTitle>
          <DialogDescription>
            Добавьте информацию о выполненной работе
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="goal_id">Цель</Label>
            <Select
              value={formData.goal_id}
              onValueChange={(value) => setFormData({ ...formData, goal_id: value })}
            >
              <SelectTrigger data-testid="goal-select">
                <SelectValue placeholder="Выберите цель" />
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

          <div>
            <Label htmlFor="date">Дата</Label>
            <Input
              id="date"
              type="date"
              data-testid="progress-date-input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="value">
              Значение ({selectedGoal?.measure_type === "full_days" ? "дней" : "часов"})
            </Label>
            <Input
              id="value"
              type="number"
              step="0.5"
              data-testid="progress-value-input"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder={selectedGoal?.measure_type === "full_days" ? "1" : "4"}
            />
          </div>

          <div>
            <Label htmlFor="note">Заметка (опционально)</Label>
            <Textarea
              id="note"
              data-testid="progress-note-input"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Дополнительная информация"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="cancel-progress-button">
              Отмена
            </Button>
            <Button type="submit" disabled={loading} data-testid="save-progress-button">
              {loading ? "Сохранение..." : editingProgress ? "Обновить" : "Добавить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}