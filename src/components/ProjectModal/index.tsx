import { useState } from 'react';
import type { Project } from '../../types';
import './style.css';

type Props = {
  mode: 'add' | 'addSub' | 'edit';
  projectToEdit?: Project | null;
  parentId?: string;
  onClose: () => void;
  onSave: (projectData: Project) => void;
};

const NEW_PROJECT_DEFAULTS: Omit<Project, 'id' | 'name'> = {
  strategicImportance: 'B',
  health: 'green',
  tasks: [],
  subProjects: [],
};

export function ProjectModal({ mode, projectToEdit, parentId, onClose, onSave }: Props) {
  const [editedProject, setEditedProject] = useState<Omit<Project, 'id'>>(() =>
    projectToEdit ? { ...projectToEdit } : { name: '', ...NEW_PROJECT_DEFAULTS }
  );

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