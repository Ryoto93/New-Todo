import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../../types';
import { getTaskTimeBlock, getTaskTimeBlocksForPeriod, timeBlocks } from '../../utils/dateUtils';
import { TimelineTask } from '../TimelineTask';
import './style.css';

type Props = { tasks: Task[] };

export function Timeline({ tasks }: Props) {
  const handleDragEnd = (event: DragEndEvent) => {
    console.log("Drag end event:", event);
    // ここに後でロジックを追加する
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="timeline-container">
        <div className="timeline-flow">
          {timeBlocks.map(block => {
            // 期間タスクと単一期限タスクを区別してフィルタリング
            const blockTasks = tasks.filter(task => {
              if (task.period) {
                // 期間タスクの場合、その期間がこのブロックにまたがるかチェック
                return getTaskTimeBlocksForPeriod(task).includes(block);
              } else {
                // 単一期限タスクの場合、従来のロジック
                return getTaskTimeBlock(task) === block;
              }
            });
            
            const isOverdue = block === '期限切れ';
            
            return (
              <div key={block} className={`time-block ${isOverdue ? 'overdue' : ''}`}>
                <div className="time-block-header">{block}</div>
                <div className="time-block-content">
                  <SortableContext
                    items={blockTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {blockTasks.map(task => <TimelineTask key={task.id} task={task} />)}
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