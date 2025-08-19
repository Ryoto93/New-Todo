import { useState } from 'react';
import { useProjectData } from './hooks/useProjectData';
import { ProjectComponent } from './components/ProjectComponent';
import { ProjectDashboardCard } from './components/ProjectDashboardCard';
import { ViewSwitcher } from './components/ViewSwitcher';
import type { ViewMode } from './components/ViewSwitcher';
import { CalendarView } from './components/CalendarView';
import { ProjectModal } from './components/ProjectModal';
import { TaskModal } from './components/TaskModal';
import type { Task, Project } from './types';
import { Search } from 'lucide-react';
import './App.css';

function App() {
  // 全てのStateをここに集約
  const {
    projects,
    toggleTaskCompletion,
    addTask,
    deleteTask,
    updateTask,
    addProject,
    addSubProject,
    updateProject,
    deleteProject,
    toggleSubtaskCompletion,
    addSubtask,
    deleteSubtask,
    updateTaskTimeBlock,
    addComment
  } = useProjectData();

  const [view, setView] = useState<ViewMode>('flow');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [taskModalState, setTaskModalState] = useState<{ mode: 'edit' | 'add'; task?: Task; projectId?: string } | null>(null);
  const [projectModalState, setProjectModalState] = useState<{ mode: 'add' | 'addSub' | 'edit'; project?: Project; parentId?: string } | null>(null);

  // --- プロジェクト検索ロジック ---
  const findProject = (projects: Project[], id: string): Project | undefined => {
    for (const project of projects) {
      if (project.id === id) return project;
      const found = findProject(project.subProjects, id);
      if (found) return found;
    }
    return undefined;
  };

  const selectedProject = selectedProjectId ? findProject(projects, selectedProjectId) : null;

  // --- ナビゲーションハンドラ群 ---
  const handleProjectSelect = (projectId: string) => setSelectedProjectId(projectId);
  const handleReturnToDashboard = () => setSelectedProjectId(null);

  // --- タスクモーダルハンドラ群 ---
  const handleOpenEditModal = (task: Task) => setTaskModalState({ mode: 'edit', task });
  const handleOpenAddModal = (projectId: string) => setTaskModalState({ mode: 'add', projectId });
  const handleCloseTaskModal = () => setTaskModalState(null);

  const handleSaveTask = (task: Task) => {
    if (taskModalState?.mode === 'add' && taskModalState.projectId) {
      addTask(taskModalState.projectId, task);
    } else {
      updateTask(task);
    }
    handleCloseTaskModal();
  };

  // --- プロジェクトモーダルハンドラ群 ---
  const handleOpenAddProjectModal = () => setProjectModalState({ mode: 'add' });
  const handleOpenAddSubProjectModal = (parentId: string) => setProjectModalState({ mode: 'addSub', parentId });
  const handleOpenEditProjectModal = (project: Project) => setProjectModalState({ mode: 'edit', project });
  const handleCloseProjectModal = () => setProjectModalState(null);

  const handleSaveProject = (projectData: Project) => {
    if (projectModalState?.mode === 'edit') {
      updateProject(projectData);
    } else if (projectModalState?.mode === 'addSub' && projectModalState.parentId) {
      addSubProject(projectModalState.parentId, projectData.name, projectData.strategicImportance, projectData.health);
    } else {
      addProject(projectData.name, projectData.strategicImportance, projectData.health);
    }
    setProjectModalState(null);
  };

  return (
    <div className="app-container">
      <header
        className="app-header"
        style={{
          position: 'absolute',
          top: '12px',
          left: '20px',
          fontSize: '0.65em',
          color: '#666',
          opacity: 0.08,
          fontWeight: '300',
          zIndex: 10,
          letterSpacing: '0.5px',
        }}
      >
        Todo
      </header>

      <div className="app-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="プロジェクトやタスクを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {!selectedProject && (
          <ViewSwitcher currentView={view} onViewChange={setView} />
        )}
      </div>

      {selectedProject ? (
        // 【詳細ビュー】
        <div>
          <button onClick={handleReturnToDashboard} className="back-to-dashboard-button">
            ← ダッシュボードに戻る
          </button>
          <ProjectComponent
            key={selectedProject.id}
            project={selectedProject}
            level={0}
            onToggleTask={toggleTaskCompletion}
            onDeleteTask={deleteTask}
            onOpenEditModal={handleOpenEditModal}
            onOpenAddModal={handleOpenAddModal}
            onOpenAddSubProjectModal={handleOpenAddSubProjectModal}
            onOpenEditProjectModal={handleOpenEditProjectModal}
            onDeleteProject={deleteProject}
            onToggleSubtask={toggleSubtaskCompletion}
            onUpdateTaskTimeBlock={updateTaskTimeBlock}
          />
        </div>
      ) : (
        // 【一覧ビュー（ダッシュボード）】
        <>
          <div className="dashboard-header">
            <h2>ダッシュボード</h2>
            <button onClick={handleOpenAddProjectModal} className="add-project-button-dashboard">
              + 新規プロジェクト
            </button>
          </div>

          {view === 'flow' ? (
            <div className="project-dashboard-grid">
              {projects.map(project => (
                <ProjectDashboardCard
                  key={project.id}
                  project={project}
                  onProjectSelect={handleProjectSelect}
                />
              ))}
            </div>
          ) : (
            <CalendarView projects={projects} onTaskClick={handleOpenEditModal} />
          )}
        </>
      )}

      {/* タスクモーダル */}
      {taskModalState && (
        <TaskModal
          taskToEdit={taskModalState.mode === 'edit' ? taskModalState.task : null}
          onClose={handleCloseTaskModal}
          onSave={handleSaveTask}
          onAddSubtask={addSubtask}
          onDeleteSubtask={deleteSubtask}
          onAddComment={addComment}
        />
      )}

      {/* プロジェクトモーダル */}
      {projectModalState && (
        <ProjectModal
          mode={projectModalState.mode}
          projectToEdit={projectModalState.project}
          parentId={projectModalState.parentId}
          onClose={handleCloseProjectModal}
          onSave={handleSaveProject}
          onAddComment={addComment}
        />
      )}
    </div>
  );
}

export default App;
