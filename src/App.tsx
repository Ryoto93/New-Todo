import { useState } from 'react';
import { useProjectData } from './hooks/useProjectData';
import { ProjectComponent } from './components/ProjectComponent';
import { ProjectModal } from './components/ProjectModal';
import type { Task, Project } from './types';
import { TaskModal } from './components/TaskModal';
import { ViewSwitcher } from './components/ViewSwitcher';
import type { ViewMode } from './components/ViewSwitcher';
import { CalendarView } from './components/CalendarView';
import { Search } from 'lucide-react';
import './App.css';

function App() {
  const { projects, toggleTaskCompletion, addTask, updateTask, addProject, addSubProject, updateProject, deleteProject, toggleSubtaskCompletion, addSubtask, deleteSubtask, updateTaskTimeBlock } = useProjectData();
  const [view, setView] = useState<ViewMode>('flow');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<{ mode: 'edit' | 'add'; task?: Task; projectId?: string } | null>(null);
  const [projectModalState, setProjectModalState] = useState<{ mode: 'add' | 'addSub' | 'edit'; project?: Project; parentId?: string } | null>(null);

  const handleOpenEditModal = (task: Task) => setModalState({ mode: 'edit', task });
  const handleOpenAddModal = (projectId: string) => setModalState({ mode: 'add', projectId });
  const handleCloseModal = () => setModalState(null);

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

  const handleSaveTask = (task: Task) => {
    if (modalState?.mode === 'add' && modalState.projectId) {
      addTask(modalState.projectId, task);
    } else {
      updateTask(task);
    }
    handleCloseModal();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Flow TODO App</h1>
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
        <ViewSwitcher currentView={view} onViewChange={setView} />
      </div>
      {view === 'flow' ? (
        <>
          <main>
            <button className="add-project-button-header" onClick={handleOpenAddProjectModal}>
              + 新規プロジェクトを作成
            </button>
            {projects.map(project => (
              <ProjectComponent
                key={project.id}
                project={project}
                level={0}
                onToggleTask={toggleTaskCompletion}
                onOpenEditModal={handleOpenEditModal}
                onOpenAddModal={handleOpenAddModal}
                onOpenAddSubProjectModal={handleOpenAddSubProjectModal}
                onOpenEditProjectModal={handleOpenEditProjectModal}
                onDeleteProject={deleteProject}
                onToggleSubtask={toggleSubtaskCompletion}
                onUpdateTaskTimeBlock={updateTaskTimeBlock}
              />
            ))}
          </main>
        </>
      ) : (
        <CalendarView projects={projects} onTaskClick={handleOpenEditModal} />
      )}
      {modalState && (
        <TaskModal
          taskToEdit={modalState.mode === 'edit' ? modalState.task : null}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          onAddSubtask={addSubtask}
          onDeleteSubtask={deleteSubtask}
        />
      )}
      {projectModalState && (
        <ProjectModal
          mode={projectModalState.mode}
          projectToEdit={projectModalState.project}
          parentId={projectModalState.parentId}
          onClose={handleCloseProjectModal}
          onSave={handleSaveProject}
        />
      )}
    </div>
  )
}

export default App
