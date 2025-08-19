import type { Project } from '../../types';
import './style.css';

type Props = {
  project: Project;
  onProjectSelect: (projectId: string) => void;
};

// タスク総数を計算するヘルパー（ProjectComponentから流用・簡素化）
const getTotalTasks = (project: Project): number => {
  let count = project.tasks.length;
  project.subProjects.forEach(sub => {
    count += getTotalTasks(sub);
  });
  return count;
};

// 完了済みタスク数を計算するヘルパー（ProjectComponentから流用・簡素化）
const getCompletedTasks = (project: Project): number => {
    let count = project.tasks.filter(t => t.isCompleted).length;
    project.subProjects.forEach(sub => {
        count += getCompletedTasks(sub);
    });
    return count;
};

export function ProjectDashboardCard({ project, onProjectSelect }: Props) {
  const totalTasks = getTotalTasks(project);
  const completedTasks = getCompletedTasks(project);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="project-dashboard-card" onClick={() => onProjectSelect(project.id)}>
      <div className="card-header">
        <h3 className="card-title">{project.name}</h3>
        <span className="card-importance">[{project.strategicImportance}]</span>
      </div>
      <div className="card-footer">
        <span>タスク: {completedTasks} / {totalTasks}</span>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <span>{progress}%</span>
      </div>
    </div>
  );
} 