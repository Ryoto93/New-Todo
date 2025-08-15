import { useSortable } from '@dnd-kit/sortable';
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
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = { P1: 'p1', P2: 'p2', P3: 'p3', P4: 'p4' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`timeline-task ${priorityColor[task.priority]}`}
    >
      {task.title}
    </div>
  );
} 