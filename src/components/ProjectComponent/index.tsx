import { useState } from 'react';
import type { Project, Task } from '../../types';
import { TaskItem } from '../TaskItem';
import { Timeline } from '../Timeline';
import { TaskFilterSort, type SortOption, type FilterOptions } from '../TaskFilterSort';
import { ZoomControls, type ZoomLevel } from '../ZoomControls';
// ★ アイコンをインポート
import { Settings, Trash2, PlusCircle } from 'lucide-react';
import './style.css';

// ファイルの先頭にヘルパー関数を追加
const getAllTasks = (project: Project): Task[] => {
  let tasks = [...project.tasks];
  for (const subProject of project.subProjects) {
    tasks = tasks.concat(getAllTasks(subProject));
  }
  return tasks;
};

type Props = {
  project: Project;
  level: number;
  onToggleTask: (taskId: string) => void;
  onOpenEditModal: (task: Task) => void;
  onOpenAddModal: (projectId: string) => void;
  onOpenAddSubProjectModal: (parentId: string) => void;
  onOpenEditProjectModal: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onUpdateTaskTimeBlock: (taskId: string, targetBlock: string, zoomLevel: 'day' | 'week' | 'month') => void;
};

// ProjectCardからProjectComponentへ改名し、再帰的に自分を呼び出す
export function ProjectComponent({ project, level, onToggleTask, onOpenEditModal, onOpenAddModal, onOpenAddSubProjectModal, onOpenEditProjectModal, onDeleteProject, onToggleSubtask, onUpdateTaskTimeBlock }: Props) {
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ hideCompleted: false });
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day');
  const [searchTerm] = useState('');
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  
  const totalTasks = getTotalTasks(project);
  const completedTasks = getCompletedTasks(project);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const healthEmoji = { green: '🟢', yellow: '🟡', red: '🔴' };
  const isSubProject = level > 0;
  const allTasks = getAllTasks(project);

  const searchString = JSON.stringify(project).toLowerCase();
  const isVisible = searchTerm ? searchString.includes(searchTerm.toLowerCase()) : true;

  if (!isVisible) {
    return null;
  }

  // ★ ソートとフィルタを適用したタスクリストを計算
  const sortedAndFilteredTasks = [...project.tasks]
    .filter(task => !filterOptions.hideCompleted || !task.isCompleted)
    .sort((a, b) => {
      if (sortOption === 'priority') {
        return a.priority.localeCompare(b.priority);
      }
      if (sortOption === 'dueDate' && a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });
  
  return (
    <div
      className={isSubProject ? 'project-component sub-project' : 'project-component'}
      style={{ marginLeft: `${level * 20}px` }} // levelに応じてインデント
    >
      <div className="project-header">
        <h3 className="project-name">{project.name}</h3>
        <div className="project-controls">
          <button 
            onClick={() => onOpenEditProjectModal(project)} 
            className="icon-button"
            title="プロジェクトを編集"
          >
            <Settings size={16} />
          </button>
          <button 
            onClick={() => { if(confirm('本当に削除しますか？')) onDeleteProject(project.id) }} 
            className="icon-button danger"
            title="プロジェクトを削除"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="project-meta">
          <span className="project-importance">[{project.strategicImportance}]</span>
          <span className="project-health">{healthEmoji[project.health]}</span>
          {!isSubProject && <span className="project-progress">進捗: {progress}%</span>}
        </div>
      </div>

      {/* ★ ここから追加・変更 ★ */}
      {level === 0 && (
        <div className="timeline-section">
          <div className="timeline-header">
            <h4>タイムライン</h4>
            <ZoomControls currentZoom={zoomLevel} onZoomChange={setZoomLevel} />
          </div>
          <Timeline tasks={allTasks} zoomLevel={zoomLevel} hoveredTag={hoveredTag} onHoverTag={setHoveredTag} onUpdateTaskTimeBlock={(taskId, targetBlock) => onUpdateTaskTimeBlock(taskId, targetBlock, zoomLevel)} />
        </div>
      )}
      <div className="project-contents">
        <div className="tasks-and-subprojects">
          <div className="tasks-header">
            <h4>タスク一覧</h4>
            <TaskFilterSort
              sortOption={sortOption}
              filterOptions={filterOptions}
              onSortChange={setSortOption}
              onFilterChange={setFilterOptions}
            />
          </div>
          <div className="task-list">
            {sortedAndFilteredTasks.map(task => 
              <TaskItem key={task.id} task={task} hoveredTag={hoveredTag} onHoverTag={setHoveredTag} onToggle={onToggleTask} onDelete={() => {}} onOpenEditModal={onOpenEditModal} onToggleSubtask={onToggleSubtask} />
            )}
            <button className="add-task-button-simple" onClick={() => onOpenAddModal(project.id)}>
              <PlusCircle size={16} />
              <span>タスクを追加</span>
            </button>
          </div>
          
          {project.subProjects.length > 0 && <h4>サブプロジェクト</h4>}
          <div className="sub-project-list">
            {project.subProjects.map(subProject => (
              <ProjectComponent
                key={subProject.id}
                project={subProject}
                level={level + 1}
                onToggleTask={onToggleTask}
                onOpenEditModal={onOpenEditModal}
                onOpenAddModal={onOpenAddModal}
                onOpenAddSubProjectModal={onOpenAddSubProjectModal}
                onOpenEditProjectModal={onOpenEditProjectModal}
                onDeleteProject={onDeleteProject}
                onToggleSubtask={onToggleSubtask}
                onUpdateTaskTimeBlock={onUpdateTaskTimeBlock}
              />
            ))}
            <button className="add-sub-project-button" onClick={() => onOpenAddSubProjectModal(project.id)}>
              <PlusCircle size={16} />
              <span>サブプロジェクトを追加</span>
            </button>
          </div>
        </div>
        
        <div className="standalone-tasks">
          {/* 将来的に単独タスクなどをここに配置する */}
        </div>
      </div>
    </div>
  );
}

// getTotalTasks と getCompletedTasks の実装
const getTotalTasks = (project: Project): number => { 
  let count = project.tasks.length; 
  for (const subProject of project.subProjects) { 
    count += getTotalTasks(subProject); 
  } 
  return count; 
};

const getCompletedTasks = (project: Project): number => { 
  let count = project.tasks.filter(t => t.isCompleted).length; 
  for (const subProject of project.subProjects) { 
    count += getCompletedTasks(subProject); 
  } 
  return count; 
}; 