import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import type { Task } from '../../types';
import { getTaskTimeBlock, getTaskTimeBlocksForPeriod, timeBlocks } from '../../utils/dateUtils';
import { TimelineTask } from '../TimelineTask';
import './style.css';

type Props = {
  tasks: Task[];
  hoveredTag: string | null;
  onHoverTag: (tag: string | null) => void;
  onUpdateTaskTimeBlock: (taskId: string, targetBlock: string) => void;
};

// ドロップ可能な時間ブロックコンポーネント
function DroppableTimeBlock({ 
  block, 
  tasks,
  hoveredTag,
  onHoverTag
}: { 
  block: string; 
  tasks: Task[];
  hoveredTag: string | null;
  onHoverTag: (tag: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: block });

  return (
    <div 
      ref={setNodeRef}
      className={`time-block ${block === '期限切れ' ? 'overdue' : ''} ${isOver ? 'drop-over' : ''}`}
    >
      <div className="time-block-header">{block}</div>
      <div className="time-block-content">
        {tasks.map(task => (
          <TimelineTask key={task.id} task={task} hoveredTag={hoveredTag} onHoverTag={onHoverTag} />
        ))}
      </div>
    </div>
  );
}

export function Timeline({ tasks, hoveredTag, onHoverTag, onUpdateTaskTimeBlock }: Props) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    
    const taskId = String(active.id);
    const targetBlock = String(over.id);
    
    // 時間ブロックにドロップされた場合のみ処理
    if (timeBlocks.includes(targetBlock)) {
      console.log(`タスク ${taskId} を ${targetBlock} に移動`);
      onUpdateTaskTimeBlock(taskId, targetBlock);
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
              <DroppableTimeBlock
                key={block}
                block={block}
                tasks={tasksInBlock}
                hoveredTag={hoveredTag}
                onHoverTag={onHoverTag}
              />
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}