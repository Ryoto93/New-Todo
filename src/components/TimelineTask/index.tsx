import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { getTaskTimeBlock } from '../../utils/dateUtils';
import './style.css';

type Props = { task: Task };

export function TimelineTask({ task }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColor = { P1: 'p1', P2: 'p2', P3: 'p3', P4: 'p4' };

  // 呼吸UIを適用するかの判定ロジックを追加
  const timeBlock = getTaskTimeBlock(task);
  const isUrgent = task.priority === 'P1' && (timeBlock === '今日' || timeBlock === '明日');
  
  // デバッグ用のコンソール出力
  if (isUrgent) {
    console.log(`呼吸UI適用: ${task.title} (${task.priority}, ${timeBlock})`);
  }
  
  const taskClassName = `timeline-task ${priorityColor[task.priority]} ${isDragging ? 'dragging' : ''} ${isUrgent ? 'breathing' : ''}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={taskClassName}
      data-urgent={isUrgent}
      data-priority={task.priority}
      data-timeblock={timeBlock}
    >
      {task.title}
    </div>
  );
} 