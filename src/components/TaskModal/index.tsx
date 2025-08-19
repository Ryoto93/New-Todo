import { useState } from 'react';
import type { Task } from '../../types';
import { CustomDatePicker } from '../CustomDatePicker';
import './style.css';

type Props = {
  taskToEdit?: Task | null; // 編集時はオブジェクト、新規作成時はnull
  onClose: () => void;
  onSave: (task: Task) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onAddComment: (targetId: string, content: string) => void;
};

const NEW_TASK_DEFAULTS: Omit<Task, 'id' | 'title'> = {
  isCompleted: false,
  priority: 'P3',
  dueDate: null,
  period: null,
  tags: [],
  subtasks: [],
  comments: [],
};



export function TaskModal({ taskToEdit, onClose, onSave, onAddSubtask, onDeleteSubtask, onAddComment }: Props) {
  const [editedTask, setEditedTask] = useState<Omit<Task, 'id'>>(() =>
    taskToEdit ? { ...taskToEdit } : { title: '', ...NEW_TASK_DEFAULTS }
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    console.log('コメント追加開始:', { newComment, taskToEdit: !!taskToEdit });
    
    // 編集モードの場合は既存のタスクにコメントを追加
    if (taskToEdit) {
      console.log('既存タスクにコメント追加:', taskToEdit.id);
      onAddComment(taskToEdit.id, newComment);
      // 即時反映のため、editedTaskのstateも更新
      const comment = { id: `temp-${Date.now()}`, content: newComment, createdAt: new Date().toISOString() };
      setEditedTask(current => ({...current!, comments: [...(current!.comments || []), comment]}));
    } else {
      console.log('新規タスクにコメント追加');
      // 新規作成モードの場合は、editedTaskに直接コメントを追加
      const comment = { id: `temp-${Date.now()}`, content: newComment, createdAt: new Date().toISOString() };
      setEditedTask(current => ({...current!, comments: [...(current!.comments || []), comment]}));
    }
    
    console.log('コメント追加完了');
    setNewComment('');
  };

  const handleSave = () => {
    if (!editedTask.title.trim()) return;
    
    const completeTask = {
      id: taskToEdit?.id || `task-${Date.now()}`,
      ...editedTask
    };
    
    onSave(completeTask);
  };



  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setEditedTask({ ...editedTask, tags });
  };

  const isEditMode = !!taskToEdit;
  const modalTitle = isEditMode ? 'タスクを編集' : '新規タスクを作成';

    return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{modalTitle}</h3>
        </div>
        
        <div className="modal-body">
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
          
          <label>納期</label>
          <CustomDatePicker task={editedTask} setEditedTask={setEditedTask} />
          
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

          {/* コメントセクション */}
          <div className="comment-section">
            <label>コメント</label>
            <div className="comment-list">
              {editedTask.comments?.map(comment => (
                <div key={comment.id} className="comment">
                  <p>{comment.content}</p>
                  <span>{new Date(comment.createdAt).toLocaleString('ja-JP')}</span>
                </div>
              ))}
            </div>
            <div className="add-comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを追加..."
              />
              <button onClick={handleAddComment} disabled={!newComment.trim()}>投稿</button>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose}>キャンセル</button>
          <button onClick={handleSave} className="save-button">保存</button>
        </div>
      </div>
    </div>
  );
} 