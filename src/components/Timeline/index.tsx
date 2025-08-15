import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../../types';
import { getTaskTimeBlock, getTaskTimeBlocksForPeriod, timeBlocks } from '../../utils/dateUtils';
import { TimelineTask } from '../TimelineTask';
import './style.css';

type Props = {
  tasks: Task[];
  onUpdateTaskTimeBlock: (taskId: string, targetBlock: string) => void;
};

export function Timeline({ tasks, onUpdateTaskTimeBlock }: Props) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.id;
    if (activeContainer !== overContainer && timeBlocks.includes(String(overContainer))) {
      onUpdateTaskTimeBlock(String(active.id), String(overContainer));
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="timeline-container">
        <div className="timeline-flow">
          {timeBlocks.map(block => {
            const tasksInBlock = tasks.filter(task => {
              if (task.period) {
                return getTaskTimeBlocksForPeriod(task).includes(block);
              } else {
                return getTaskTimeBlock(task) === block;
              }
            });

            return (
              <div key={block} className={`time-block ${block === '期限切れ' ? 'overdue' : ''}`}>
                <div className="time-block-header">{block}</div>
                <div className="time-block-content">
                  <SortableContext id={block} items={tasksInBlock.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasksInBlock.map(task => <TimelineTask key={task.id} task={task} />)}
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
} 