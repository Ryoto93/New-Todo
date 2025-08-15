import { useState, useEffect } from 'react';
import type { Project, Task } from '../types';
import { getItem, setItem } from '../utils/localStorage';
import { initialData } from '../data/initialData';

const STORAGE_KEY = 'flow-todo-app-data';

export function useProjectData() {
	const [projects, setProjects] = useState<Project[]>(() => {
		return getItem<Project[]>(STORAGE_KEY) || initialData;
	});

	useEffect(() => {
		setItem(STORAGE_KEY, projects);
	}, [projects]);

	const toggleTaskCompletion = (taskId: string) => {
		const newProjects = JSON.parse(JSON.stringify(projects)); // 深いコピーで安全にデータを複製

		const findAndToggle = (items: (Project | Task)[]) => {
			for (const item of items) {
				if ('tasks' in item && item.tasks) { // Project or SubProject
					const task = item.tasks.find(t => t.id === taskId);
					if (task) {
						task.isCompleted = !task.isCompleted;
						return true;
					}
					if (findAndToggle(item.subProjects)) return true;
				}
			}
			return false;
		};
		findAndToggle(newProjects);
		setProjects(newProjects);
	};

	const addTask = (projectId: string, newTask: Task) => {
		const newProjects = JSON.parse(JSON.stringify(projects));
		
		const findAndAdd = (projArray: Project[]) => {
			for (const proj of projArray) {
				if (proj.id === projectId) {
					proj.tasks.push(newTask);
					return true;
				}
				if (findAndAdd(proj.subProjects)) return true;
			}
			return false;
		};
		
		findAndAdd(newProjects);
		setProjects(newProjects);
	};

	const deleteTask = (taskId: string) => {
		const newProjects = JSON.parse(JSON.stringify(projects));

		const findAndDelete = (projArray: Project[]) => {
			for (const proj of projArray) {
				const taskIndex = proj.tasks.findIndex(t => t.id === taskId);
				if (taskIndex > -1) {
					proj.tasks.splice(taskIndex, 1);
					return true;
				}
				if (findAndDelete(proj.subProjects)) return true;
			}
			return false;
		};

		findAndDelete(newProjects);
		setProjects(newProjects);
	};

	const updateTask = (updatedTask: Task) => {
		const newProjects = JSON.parse(JSON.stringify(projects));

		const findAndUpdate = (projArray: Project[]): boolean => {
			for (const proj of projArray) {
				const taskIndex = proj.tasks.findIndex(t => t.id === updatedTask.id);
				if (taskIndex > -1) {
					proj.tasks[taskIndex] = updatedTask;
					return true;
				}
				if (findAndUpdate(proj.subProjects)) return true;
			}
			return false;
		};

		findAndUpdate(newProjects);
		setProjects(newProjects);
	};

	const addProject = (name: string, strategicImportance: Project['strategicImportance'], health: Project['health']) => {
		if (!name.trim()) return;

		const newProject: Project = {
			id: `proj-${Date.now()}`,
			name: name.trim(),
			strategicImportance,
			health,
			tasks: [],
			subProjects: [],
		};

		setProjects(prevProjects => [...prevProjects, newProject]);
	};

	const addSubProject = (parentId: string, name: string, strategicImportance: Project['strategicImportance'], health: Project['health']) => {
		if (!name.trim()) return;
		
		const newSubProject: Project = {
			id: `proj-${Date.now()}`,
			name: name.trim(),
			strategicImportance,
			health,
			tasks: [],
			subProjects: [],
		};

		const newProjects = JSON.parse(JSON.stringify(projects));

		const findAndAdd = (projArray: Project[]) => {
			for (const proj of projArray) {
				if (proj.id === parentId) {
					proj.subProjects.push(newSubProject);
					return true;
				}
				if (findAndAdd(proj.subProjects)) return true;
			}
			return false;
		};

		findAndAdd(newProjects);
		setProjects(newProjects);
	};

	const updateProject = (updatedProject: Project) => {
		const newProjects = JSON.parse(JSON.stringify(projects));
		
		const findAndUpdate = (projArray: Project[]): boolean => {
			for (let i = 0; i < projArray.length; i++) {
				if (projArray[i].id === updatedProject.id) {
					projArray[i] = updatedProject;
					return true;
				}
				if (findAndUpdate(projArray[i].subProjects)) return true;
			}
			return false;
		};
		
		findAndUpdate(newProjects);
		setProjects(newProjects);
	};

	const deleteProject = (projectId: string) => {
		const newProjects = JSON.parse(JSON.stringify(projects));
		
		const findAndDelete = (projArray: Project[]): boolean => {
			const projIndex = projArray.findIndex(p => p.id === projectId);
			if (projIndex > -1) {
				projArray.splice(projIndex, 1);
				return true;
			}
			for (const proj of projArray) {
				if (findAndDelete(proj.subProjects)) return true;
			}
			return false;
		};
		
		findAndDelete(newProjects);
		setProjects(newProjects);
	};

	const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
		const newProjects = JSON.parse(JSON.stringify(projects));

		const findAndToggle = (projArray: Project[]): boolean => {
			for (const proj of projArray) {
				const task = proj.tasks.find(t => t.id === taskId);
				if (task) {
					const subtask = task.subtasks.find(st => st.id === subtaskId);
					if (subtask) {
						subtask.isCompleted = !subtask.isCompleted;
						return true;
					}
				}
				if (findAndToggle(proj.subProjects)) return true;
			}
			return false;
		};

		findAndToggle(newProjects);
		setProjects(newProjects);
	};

	const addSubtask = (taskId: string, title: string) => {
		if (!title.trim()) return;
		
		const newSubtask = { id: `sub-${Date.now()}`, title: title.trim(), isCompleted: false };
		const newProjects = JSON.parse(JSON.stringify(projects));
		
		const findAndAdd = (projArray: Project[]): boolean => {
			for (const proj of projArray) {
				const task = proj.tasks.find(t => t.id === taskId);
				if (task) {
					task.subtasks.push(newSubtask);
					return true;
				}
				if (findAndAdd(proj.subProjects)) return true;
			}
			return false;
		};
		
		findAndAdd(newProjects);
		setProjects(newProjects);
	};

	const deleteSubtask = (taskId: string, subtaskId: string) => {
		const newProjects = JSON.parse(JSON.stringify(projects));
		
		const findAndDelete = (projArray: Project[]): boolean => {
			for (const proj of projArray) {
				const task = proj.tasks.find(t => t.id === taskId);
				if (task) {
					const subtaskIndex = task.subtasks.findIndex(st => st.id === subtaskId);
					if (subtaskIndex > -1) {
						task.subtasks.splice(subtaskIndex, 1);
						return true;
					}
				}
				if (findAndDelete(proj.subProjects)) return true;
			}
			return false;
		};
		
		findAndDelete(newProjects);
		setProjects(newProjects);
	};

	const updateTaskTimeBlock = (taskId: string, targetBlock: string) => {
		const getNewDate = (block: string): Date | null => {
			const now = new Date();
			const todayJST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
			todayJST.setHours(23, 59, 59, 999); // 時刻は一日の終わりに設定
			switch(block) {
				case '今日': return todayJST;
				case '明日': return new Date(new Date(todayJST).setDate(todayJST.getDate() + 1));
				case '3日後': return new Date(new Date(todayJST).setDate(todayJST.getDate() + 3));
				case '1週間後': return new Date(new Date(todayJST).setDate(todayJST.getDate() + 7));
				case '2週間後': return new Date(new Date(todayJST).setDate(todayJST.getDate() + 14));
				case 'それ以降': return new Date(new Date(todayJST).setDate(todayJST.getDate() + 30));
				default: return null;
			}
		};

		const newDueDate = getNewDate(targetBlock);
		if (!newDueDate) return;

		const newProjects = JSON.parse(JSON.stringify(projects));

		const findAndUpdate = (projArray: Project[]): boolean => {
			for (const proj of projArray) {
				const task = proj.tasks.find(t => t.id === taskId);
				if (task) {
					task.dueDate = newDueDate.toISOString();
					task.period = null;
					return true;
				}
				if (findAndUpdate(proj.subProjects)) return true;
			}
			return false;
		};

		findAndUpdate(newProjects);
		setProjects(newProjects);
	};

	// setProjectsは直接渡さず、必要な操作関数を渡すように変更
	return { projects, toggleTaskCompletion, addTask, deleteTask, updateTask, addProject, addSubProject, updateProject, deleteProject, toggleSubtaskCompletion, addSubtask, deleteSubtask, updateTaskTimeBlock };
} 