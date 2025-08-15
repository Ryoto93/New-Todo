import { useState } from 'react';
import { useProjectData } from './hooks/useProjectData';
import { ProjectComponent } from './components/ProjectComponent';
import { ProjectModal } from './components/ProjectModal';
import type { Task, Project } from './types';
import { TaskModal } from './components/TaskModal';
import './App.css';

function App() {
  const { projects, toggleTaskCompletion, addTask, deleteTask, updateTask, addProject, addSubProject, updateProject, deleteProject, toggleSubtaskCompletion, addSubtask, deleteSubtask } = useProjectData();
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
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onOpenEditModal={handleOpenEditModal}
            onOpenAddModal={handleOpenAddModal}
            onOpenAddSubProjectModal={handleOpenAddSubProjectModal}
            onOpenEditProjectModal={handleOpenEditProjectModal}
            onDeleteProject={deleteProject}
            onToggleSubtask={toggleSubtaskCompletion}
          />
        ))}
      </main>
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
