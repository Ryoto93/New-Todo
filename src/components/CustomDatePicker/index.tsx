import { DayPicker } from 'react-day-picker';
import { ja } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import './style.css';
import type { Task } from '../../types';

type Props = {
  task: Omit<Task, 'id'>;
  setEditedTask: React.Dispatch<React.SetStateAction<Omit<Task, 'id'>>>;
};

export function CustomDatePicker({ task, setEditedTask }: Props) {
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const newDueDate = new Date(date.setHours(23, 59, 59, 999)).toISOString();
    setEditedTask({ ...task, dueDate: newDueDate, period: null });
  };

  return (
    <div className="custom-datepicker-wrapper">
      <DayPicker
        mode="single"
        selected={task.dueDate ? new Date(task.dueDate) : undefined}
        onSelect={handleDateSelect}
        locale={ja}
        showOutsideDays
        fixedWeeks
      />
    </div>
  );
} 