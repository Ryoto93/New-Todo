import type { Task } from '../types';
import type { ZoomLevel } from '../components/ZoomControls';

const today = new Date(new Date().setHours(0, 0, 0, 0));

// --- 日表示用のヘルパー ---
const dayTimeBlocks = ['期限切れ', '今日', '明日', '3日後', '1週間後', '2週間後', 'それ以降'];

const getDayBlock = (task: Task): string => {
  const dueDateString = task.dueDate || task.period?.start;
  if (!dueDateString) return '';
  
  const dueDate = new Date(new Date(dueDateString).setHours(0, 0, 0, 0));
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return dayTimeBlocks[0];
  if (diffDays === 0) return dayTimeBlocks[1];
  if (diffDays === 1) return dayTimeBlocks[2];
  if (diffDays <= 3) return dayTimeBlocks[3];
  if (diffDays <= 7) return dayTimeBlocks[4];
  if (diffDays <= 14) return dayTimeBlocks[5];
  return dayTimeBlocks[6];
};

// 期間タスクの日表示用ブロック計算
const getDayBlocksForPeriod = (task: Task): string[] => {
  if (!task.period) return [];
  
  const startDate = new Date(new Date(task.period.start).setHours(0, 0, 0, 0));
  const endDate = new Date(new Date(task.period.end).setHours(0, 0, 0, 0));
  
  const spannedBlocks = new Set<string>();
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) spannedBlocks.add(dayTimeBlocks[0]);
    else if (diffDays === 0) spannedBlocks.add(dayTimeBlocks[1]);
    else if (diffDays === 1) spannedBlocks.add(dayTimeBlocks[2]);
    else if (diffDays <= 3) spannedBlocks.add(dayTimeBlocks[3]);
    else if (diffDays <= 7) spannedBlocks.add(dayTimeBlocks[4]);
    else if (diffDays <= 14) spannedBlocks.add(dayTimeBlocks[5]);
    else spannedBlocks.add(dayTimeBlocks[6]);
  }
  
  return Array.from(spannedBlocks);
};

// --- 週表示用のヘルパー ---
const weekTimeBlocks = ['過去', '今週', '来週', '再来週', '4週間後', 'それ以降'];

const getWeekBlock = (task: Task): string => {
  const dueDateString = task.dueDate || task.period?.start;
  if (!dueDateString) return '';
  
  const dueDate = new Date(new Date(dueDateString).setHours(0, 0, 0, 0));
  const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks < 0) return weekTimeBlocks[0];
  if (diffWeeks === 0) return weekTimeBlocks[1];
  if (diffWeeks === 1) return weekTimeBlocks[2];
  if (diffWeeks === 2) return weekTimeBlocks[3];
  if (diffWeeks <= 4) return weekTimeBlocks[4];
  return weekTimeBlocks[5];
};

// 期間タスクの週表示用ブロック計算
const getWeekBlocksForPeriod = (task: Task): string[] => {
  if (!task.period) return [];
  
  const startDate = new Date(new Date(task.period.start).setHours(0, 0, 0, 0));
  const endDate = new Date(new Date(task.period.end).setHours(0, 0, 0, 0));
  
  const spannedBlocks = new Set<string>();
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
    const diffDays = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    
    if (diffWeeks < 0) spannedBlocks.add(weekTimeBlocks[0]);
    else if (diffWeeks === 0) spannedBlocks.add(weekTimeBlocks[1]);
    else if (diffWeeks === 1) spannedBlocks.add(weekTimeBlocks[2]);
    else if (diffWeeks === 2) spannedBlocks.add(weekTimeBlocks[3]);
    else if (diffWeeks <= 4) spannedBlocks.add(weekTimeBlocks[4]);
    else spannedBlocks.add(weekTimeBlocks[5]);
  }
  
  return Array.from(spannedBlocks);
};

// --- 月表示用のヘルパー ---
const monthTimeBlocks = ['過去', '今月', '来月', '再来月', '3ヶ月後', 'それ以降'];

const getMonthBlock = (task: Task): string => {
  const dueDateString = task.dueDate || task.period?.start;
  if (!dueDateString) return '';
  
  const dueDate = new Date(dueDateString);
  const diffMonths = (dueDate.getFullYear() - today.getFullYear()) * 12 + (dueDate.getMonth() - today.getMonth());

  if (diffMonths < 0) return monthTimeBlocks[0];
  if (diffMonths === 0) return monthTimeBlocks[1];
  if (diffMonths === 1) return monthTimeBlocks[2];
  if (diffMonths === 2) return monthTimeBlocks[3];
  if (diffMonths <= 3) return monthTimeBlocks[4];
  return monthTimeBlocks[5];
};

// 期間タスクの月表示用ブロック計算
const getMonthBlocksForPeriod = (task: Task): string[] => {
  if (!task.period) return [];
  
  const startDate = new Date(task.period.start);
  const endDate = new Date(task.period.end);
  
  const spannedBlocks = new Set<string>();
  
  for (let d = new Date(startDate.getFullYear(), startDate.getMonth(), 1); 
       d <= endDate; 
       d.setMonth(d.getMonth() + 1)) {
    const diffMonths = (d.getFullYear() - today.getFullYear()) * 12 + (d.getMonth() - today.getMonth());
    
    if (diffMonths < 0) spannedBlocks.add(monthTimeBlocks[0]);
    else if (diffMonths === 0) spannedBlocks.add(monthTimeBlocks[1]);
    else if (diffMonths === 1) spannedBlocks.add(monthTimeBlocks[2]);
    else if (diffMonths === 2) spannedBlocks.add(monthTimeBlocks[3]);
    else if (diffMonths <= 3) spannedBlocks.add(monthTimeBlocks[4]);
    else spannedBlocks.add(monthTimeBlocks[5]);
  }
  
  return Array.from(spannedBlocks);
};

// ★★★ ズームレベルに応じて適切なタイムブロックと分類関数を返すメイン関数 ★★★
export const getTimeBlockConfig = (zoomLevel: ZoomLevel) => {
  switch (zoomLevel) {
    case 'week':
      return { timeBlocks: weekTimeBlocks, getBlock: getWeekBlock, getPeriodBlocks: getWeekBlocksForPeriod };
    case 'month':
      return { timeBlocks: monthTimeBlocks, getBlock: getMonthBlock, getPeriodBlocks: getMonthBlocksForPeriod };
    case 'day':
    default:
      return { timeBlocks: dayTimeBlocks, getBlock: getDayBlock, getPeriodBlocks: getDayBlocksForPeriod };
  }
}; 