import type { Project, Task } from '../../types';
import { TaskItem } from '../TaskItem';
import { Timeline } from '../Timeline';
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
  level: number; // 階層の深さを管理する新しいprops
  onToggleTask: (taskId: string) => void; // propsの型定義を追加
  onAddTask: (projectId: string, newTask: Task) => void; // 型定義追加
  onDeleteTask: (taskId: string) => void; // 型定義追加
  onOpenEditModal: (task: Task) => void; // 型定義追加
  onOpenAddModal: (projectId: string) => void; // 型定義追加
  onOpenAddSubProjectModal: (parentId: string) => void; // 型定義追加
  onOpenEditProjectModal: (project: Project) => void; // 型定義追加
  onDeleteProject: (projectId: string) => void; // 型定義追加
  onToggleSubtask: (taskId: string, subtaskId: string) => void; // 型定義追加
  onUpdateTaskTimeBlock: (taskId: string, targetBlock: string) => void; // 型定義追加
};

// ProjectCardからProjectComponentへ改名し、再帰的に自分を呼び出す
export function ProjectComponent({ project, level, onToggleTask, onAddTask, onDeleteTask, onOpenEditModal, onOpenAddModal, onOpenAddSubProjectModal, onOpenEditProjectModal, onDeleteProject, onToggleSubtask, onUpdateTaskTimeBlock }: Props) {
  const totalTasks = getTotalTasks(project);
  const completedTasks = getCompletedTasks(project);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const healthEmoji = { green: '🟢', yellow: '🟡', red: '🔴' };
  const isSubProject = level > 0;
  const allTasks = getAllTasks(project); // 全タスクを収集
  
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
      {level === 0 && <Timeline tasks={allTasks} onUpdateTaskTimeBlock={onUpdateTaskTimeBlock} />} {/* 最上位のプロジェクトにのみTimelineを表示、全タスクをpropsで渡す */}
      <div className="project-contents">
        <div className="tasks-and-subprojects">
          <h4>タスク一覧</h4>
          <div className="task-list">
                    {project.tasks.map(task => 
          <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} onOpenEditModal={onOpenEditModal} onToggleSubtask={onToggleSubtask} />
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
              onAddTask={onAddTask}
              onDeleteTask={onDeleteTask}
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