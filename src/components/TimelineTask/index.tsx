import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`timeline-task ${priorityColor[task.priority]} ${isDragging ? 'dragging' : ''}`}
    >
      {task.title}
    </div>
  );
} 