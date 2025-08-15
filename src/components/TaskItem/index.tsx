import type { Task } from '../../types';
import { SubtaskList } from '../SubtaskList';
import './style.css';

type Props = {
  task: Task;
  onToggle: (taskId: string) => void; // propsの型定義を追加
  onDelete: (taskId: string) => void; // 型定義追加
  onOpenEditModal: (task: Task) => void; // 型定義追加
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
};

export function TaskItem({ task, onToggle, onDelete, onOpenEditModal, onToggleSubtask }: Props) {
  const priorityColor = {
    P1: '#ff4d4f', // 赤
    P2: '#faad14', // 黄
    P3: '#1890ff', // 青
    P4: '#bfbfbf', // グレー
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hasTime = isoString.slice(11) !== '00:00:00.000Z' && isoString.slice(11) !== '23:59:59.999Z';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      ...(hasTime && { hour: '2-digit', minute: '2-digit' })
    };
    return date.toLocaleDateString('ja-JP', options);
  };

  const handleDelete = () => {
    if (window.confirm(`タスク「${task.title}」を本当に削除しますか？`)) {
      onDelete(task.id);
    }
  };

  return (
    <div className={`task-item ${task.isCompleted ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => onToggle(task.id)}
      />
      <div className="task-main">
        <span className="task-title" onClick={() => onOpenEditModal(task)}>{task.title}</span>
        {(task.dueDate || task.period) &&
          <div className="task-due-date">
            📅 {task.dueDate ? formatDate(task.dueDate) : `${formatDate(task.period!.start)} - ${formatDate(task.period!.end)}`}
          </div>
        }
        <SubtaskList task={task} onToggleSubtask={onToggleSubtask} />
      </div>
      <span className="task-priority" style={{ backgroundColor: priorityColor[task.priority] }}>
        {task.priority}
      </span>
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="task-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <button onClick={handleDelete} className="delete-task-button">×</button>
    </div>
  );
} 