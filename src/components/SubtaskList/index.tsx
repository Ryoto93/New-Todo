import type { Task } from '../../types';
import './style.css';

type Props = {
  task: Task;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
};

export function SubtaskList({ task, onToggleSubtask }: Props) {
  if (task.subtasks.length === 0) return null;
  
  const completedCount = task.subtasks.filter(st => st.isCompleted).length;
  const progress = (completedCount / task.subtasks.length) * 100;
  
  return (
    <div className="subtask-container">
      <div className="subtask-progress-bar">
        <div className="subtask-progress" style={{ width: `${progress}%` }}></div>
      </div>
      <ul className="subtask-list">
        {task.subtasks.map(subtask => (
          <li key={subtask.id} className={subtask.isCompleted ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={subtask.isCompleted}
              onChange={() => onToggleSubtask(task.id, subtask.id)}
            />
            <span>{subtask.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 