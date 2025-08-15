import { useState } from 'react';
import type { Task } from '../../types';
import './style.css';

type Props = {
  taskToEdit?: Task | null; // 編集時はオブジェクト、新規作成時はnull
  onClose: () => void;
  onSave: (task: Task) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
};

const NEW_TASK_DEFAULTS: Omit<Task, 'id' | 'title'> = {
  isCompleted: false,
  priority: 'P3',
  dueDate: null,
  period: null,
  tags: [],
  subtasks: [],
};

type DateType = 'specific' | 'period';

export function TaskModal({ taskToEdit, onClose, onSave, onAddSubtask, onDeleteSubtask }: Props) {
  const [editedTask, setEditedTask] = useState<Omit<Task, 'id'>>(() =>
    taskToEdit ? { ...taskToEdit } : { title: '', ...NEW_TASK_DEFAULTS }
  );
  const [dateType, setDateType] = useState<DateType>(taskToEdit?.period ? 'period' : 'specific');
  const [hasTime, setHasTime] = useState(!!taskToEdit?.dueDate && taskToEdit.dueDate.slice(11) !== '00:00:00.000Z');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !taskToEdit) return;
    onAddSubtask(taskToEdit.id, newSubtaskTitle);
    // UIを即時反映させるため、editedTaskのstateも更新
    const newSubtask = { id: `temp-${Date.now()}`, title: newSubtaskTitle.trim(), isCompleted: false };
    setEditedTask(current => ({...current!, subtasks: [...current!.subtasks, newSubtask]}));
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!taskToEdit) return;
    onDeleteSubtask(taskToEdit.id, subtaskId);
    setEditedTask(current => ({...current!, subtasks: current!.subtasks.filter(st => st.id !== subtaskId)}));
  };

  const handleSave = () => {
    if (!editedTask.title.trim()) return;
    
    const finalTask = { ...editedTask };
    if (dateType === 'specific') {
      finalTask.period = null;
      if (!hasTime && finalTask.dueDate) {
        // 時刻なしの場合、その日の終わり(23:59:59)に設定する
        const dateOnly = finalTask.dueDate.slice(0, 10);
        finalTask.dueDate = new Date(`${dateOnly}T23:59:59.999`).toISOString();
      }
    } else {
      finalTask.dueDate = null;
    }

    const completeTask = {
      id: taskToEdit?.id || `task-${Date.now()}`,
      ...finalTask
    };
    
    onSave(completeTask);
  };

  // datetime-local と date のためのフォーマットヘルパー
  const toDateTimeInputFormat = (isoString: string | null) => isoString ? isoString.slice(0, 16) : '';
  const toDateInputFormat = (isoString: string | null) => isoString ? isoString.slice(0, 10) : '';

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setEditedTask({ ...editedTask, tags });
  };

  const isEditMode = !!taskToEdit;
  const modalTitle = isEditMode ? 'タスクを編集' : '新規タスクを作成';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{modalTitle}</h3>
        
        <label>タイトル</label>
        <input 
          type="text" 
          value={editedTask.title} 
          onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
        />
        
        <label>優先度</label>
        <select 
          value={editedTask.priority} 
          onChange={e => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
        >
          <option value="P1">P1: 最優先</option>
          <option value="P2">P2: 計画</option>
          <option value="P3">P3: 後回し</option>
        </select>
        
        <label>納期タイプ</label>
        <div className="date-type-selector">
          <label><input type="radio" value="specific" checked={dateType === 'specific'} onChange={() => setDateType('specific')} /> 締切日</label>
          <label><input type="radio" value="period" checked={dateType === 'period'} onChange={() => setDateType('period')} /> 期間</label>
        </div>
        
        {dateType === 'specific' ? (
          <div>
            <label>締切日</label>
            <input
              type={hasTime ? "datetime-local" : "date"}
              value={hasTime ? toDateTimeInputFormat(editedTask.dueDate) : toDateInputFormat(editedTask.dueDate)}
              onChange={e => setEditedTask({ ...editedTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
            <div className="checkbox-wrapper">
              <input id="hasTimeCheckbox" type="checkbox" checked={hasTime} onChange={e => setHasTime(e.target.checked)} />
              <label htmlFor="hasTimeCheckbox">時刻を設定する</label>
            </div>
          </div>
        ) : (
          <div className="period-inputs">
            <div>
              <label>開始日</label>
              <input 
                type="date" 
                value={toDateInputFormat(editedTask.period?.start || null)} 
                onChange={e => setEditedTask({ ...editedTask, period: { ...editedTask.period!, start: new Date(e.target.value).toISOString() } })} 
              />
            </div>
            <div>
              <label>終了日</label>
              <input 
                type="date" 
                value={toDateInputFormat(editedTask.period?.end || null)} 
                onChange={e => setEditedTask({ ...editedTask, period: { ...editedTask.period!, end: new Date(e.target.value).toISOString() } })} 
              />
            </div>
          </div>
        )}
        
        <label>タグ (カンマ区切り)</label>
        <input 
          type="text" 
          value={editedTask.tags.join(', ')} 
          onChange={handleTagChange}
        />
        
        {/* サブタスク管理セクション */}
        {taskToEdit && (
          <div className="subtask-editor">
            <label>サブタスク</label>
            {editedTask.subtasks.map(subtask => (
              <div key={subtask.id} className="subtask-item">
                <span>{subtask.title}</span>
                <button onClick={() => handleDeleteSubtask(subtask.id)} className="delete-subtask-btn">×</button>
              </div>
            ))}
            <div className="add-subtask-form">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="新しいサブタスクを追加"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              />
              <button onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>追加</button>
            </div>
          </div>
        )}
        
        <div className="modal-actions">
          <button onClick={onClose}>キャンセル</button>
          <button onClick={handleSave} className="save-button">保存</button>
        </div>
      </div>
    </div>
  );
} 