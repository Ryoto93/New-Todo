import { useState } from 'react';
import type { Project } from '../../types';
import './style.css';

type Props = {
  mode: 'add' | 'addSub' | 'edit';
  projectToEdit?: Project | null;
  parentId?: string;
  onClose: () => void;
  onSave: (projectData: Project) => void;
  onAddComment: (targetId: string, content: string) => void;
};

const NEW_PROJECT_DEFAULTS: Omit<Project, 'id' | 'name'> = {
  strategicImportance: 'B',
  health: 'green',
  tasks: [],
  subProjects: [],
  comments: [],
};

export function ProjectModal({ mode, projectToEdit, parentId, onClose, onSave, onAddComment }: Props) {
  const [editedProject, setEditedProject] = useState<Omit<Project, 'id'>>(() =>
    projectToEdit ? { ...projectToEdit } : { name: '', ...NEW_PROJECT_DEFAULTS }
  );
  const [newComment, setNewComment] = useState('');

  const handleSave = () => {
    if (!editedProject.name.trim()) return;
    
    const completeProject = {
      id: projectToEdit?.id || `proj-${Date.now()}`,
      ...editedProject
    };
    
    // parentIdが存在する場合は、サブプロジェクト作成モードとして処理
    if (parentId && mode === 'addSub') {
      console.log(`Creating subproject under parent: ${parentId}`);
    }
    
    onSave(completeProject);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    console.log('プロジェクトコメント追加開始:', { newComment, projectToEdit: !!projectToEdit });
    
    // 編集モードの場合は既存のプロジェクトにコメントを追加
    if (projectToEdit) {
      console.log('既存プロジェクトにコメント追加:', projectToEdit.id);
      onAddComment(projectToEdit.id, newComment);
      // 即時反映のため、editedProjectのstateも更新
      const comment = { id: `temp-${Date.now()}`, content: newComment, createdAt: new Date().toISOString() };
      setEditedProject(current => ({...current!, comments: [...(current!.comments || []), comment]}));
    } else {
      console.log('新規プロジェクトにコメント追加');
      // 新規作成モードの場合は、editedProjectに直接コメントを追加
      const comment = { id: `temp-${Date.now()}`, content: newComment, createdAt: new Date().toISOString() };
      setEditedProject(current => ({...current!, comments: [...(current!.comments || []), comment]}));
    }
    
    console.log('プロジェクトコメント追加完了');
    setNewComment('');
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return '新規プロジェクトを作成';
      case 'addSub': return 'サブプロジェクトを追加';
      case 'edit': return 'プロジェクトを編集';
      default: return 'プロジェクト';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{getModalTitle()}</h3>
        
        <label>名前</label>
        <input 
          type="text" 
          value={editedProject.name} 
          onChange={e => setEditedProject({ ...editedProject, name: e.target.value })} 
          required 
          autoFocus
        />
        
        <label>戦略的重要性</label>
        <select 
          value={editedProject.strategicImportance} 
          onChange={e => setEditedProject({ ...editedProject, strategicImportance: e.target.value as Project['strategicImportance'] })}
        >
          <option value="S">S: トップ戦略</option>
          <option value="A">A: 主要</option>
          <option value="B">B: 標準</option>
          <option value="C">C: 補助</option>
        </select>
        
        <label>健全性</label>
        <select 
          value={editedProject.health} 
          onChange={e => setEditedProject({ ...editedProject, health: e.target.value as Project['health'] })}
        >
          <option value="green">🟢 順調</option>
          <option value="yellow">🟡 要注意</option>
          <option value="red">🔴 危険</option>
        </select>

        {/* コメントセクション */}
        <div className="comment-section">
          <label>コメント</label>
          <div className="comment-list">
            {editedProject.comments?.map(comment => (
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
        
        <div className="modal-actions">
          <button onClick={onClose}>キャンセル</button>
          <button onClick={handleSave} className="save-button" disabled={!editedProject.name.trim()}>
            {mode === 'edit' ? '更新' : '作成'}
          </button>
        </div>
      </div>
    </div>
  );
} 