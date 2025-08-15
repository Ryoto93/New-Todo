import type { Task } from '../types';

// ★ timeBlocksをexport可能にし、「期限切れ」を追加
export const timeBlocks = ['期限切れ', '今日', '明日', '3日後', '1週間後', '2週間後', 'それ以降'];

export const getTaskTimeBlock = (task: Task): string => {
  const dueDateString = task.dueDate || task.period?.start;
  if (!dueDateString) return '';

  const now = new Date(); // 現在時刻
  const dueDate = new Date(dueDateString);

  // 時間を無視して日付のみで比較するために、時刻をリセット
  now.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return timeBlocks[0]; // ★ 期限切れ
  if (diffDays === 0) return timeBlocks[1]; // 今日
  if (diffDays === 1) return timeBlocks[2]; // 明日
  if (diffDays <= 3) return timeBlocks[3]; // 3日後
  if (diffDays <= 7) return timeBlocks[4]; // 1週間後
  if (diffDays <= 14) return timeBlocks[5]; // 2週間後
  return timeBlocks[6]; // それ以降
};



export const getTaskTimeBlocksForPeriod = (task: Task): string[] => {
  if (!task.period) return [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const startDate = new Date(task.period.start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(task.period.end);
  endDate.setHours(0, 0, 0, 0);

  const startDiffDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const endDiffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const spannedBlocks = new Set<string>();

  for (let i = startDiffDays; i <= endDiffDays; i++) {
    if (i < 0) { spannedBlocks.add(timeBlocks[0]); continue; }
    if (i === 0) { spannedBlocks.add(timeBlocks[1]); continue; }
    if (i === 1) { spannedBlocks.add(timeBlocks[2]); continue; }
    if (i <= 3) { spannedBlocks.add(timeBlocks[3]); continue; }
    if (i <= 7) { spannedBlocks.add(timeBlocks[4]); continue; }
    if (i <= 14) { spannedBlocks.add(timeBlocks[5]); continue; }
    spannedBlocks.add(timeBlocks[6]);
  }
  
  return Array.from(spannedBlocks);
}; 