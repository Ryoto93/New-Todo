import { useState, useEffect } from 'react';
import type { Project, Task, Comment } from '../types';
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

	// ★ 磁気タイル機能：期限が過去のタスクを今日に自動引き寄せ
	useEffect(() => {
		const intervalId = setInterval(() => {
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

			let needsUpdate = false;
			const updatedProjects = JSON.parse(JSON.stringify(projects));
			
			const findAndPullTasks = (projArray: Project[]) => {
				for (const proj of projArray) {
					for (const task of proj.tasks) {
						if (task.dueDate) {
							const dueDate = new Date(task.dueDate);
							dueDate.setHours(0, 0, 0, 0);
							// 期限が過去（今日より前）のタスクを今日に引き寄せる
							if (dueDate < today) {
								const todayEndDate = new Date(today);
								todayEndDate.setHours(23, 59, 59, 999);
								task.dueDate = todayEndDate.toISOString();
								needsUpdate = true;
								console.log(`磁気タイル機能：タスク「${task.title}」を今日に引き寄せました`);
							}
						}
					}
					findAndPullTasks(proj.subProjects);
				}
			};
			
			findAndPullTasks(updatedProjects);
			
			if (needsUpdate) {
				console.log("磁気タイル機能が作動しました：タスクを今日に引き寄せます。");
				setProjects(updatedProjects);
			}
		}, 60000); // 60000ミリ秒 = 1分ごとにチェック
		
		// コンポーネントがアンマウントされた時にインターバルをクリアする
		return () => clearInterval(intervalId);
	}, [projects]); // projectsが変更されるたびにeffectを再設定

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
			comments: [], // ★ commentsプロパティを追加
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
			comments: [], // ★ commentsプロパティを追加
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

	const updateTaskTimeBlock = (taskId: string, targetBlock: string, zoomLevel: 'day' | 'week' | 'month') => {
		const getNewDate = (block: string, zoom: 'day' | 'week' | 'month'): Date | null => {
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

			if (zoom === 'day') {
				switch(block) {
					case '今日': return today;
					case '明日': return new Date(new Date(today).setDate(today.getDate() + 1));
					case '3日後': return new Date(new Date(today).setDate(today.getDate() + 3));
					case '1週間後': return new Date(new Date(today).setDate(today.getDate() + 7));
					case '2週間後': return new Date(new Date(today).setDate(today.getDate() + 14));
					case 'それ以降': return new Date(new Date(today).setDate(today.getDate() + 30));
					default: return null;
				}
			}
			if (zoom === 'week') {
				const dayOfWeek = today.getDay(); // 0 (日) - 6 (土)
				const weekStart = new Date(today.setDate(today.getDate() - dayOfWeek + 1)); // 週の始まり（月曜）
				switch(block) {
					case '今週': return weekStart;
					case '来週': return new Date(new Date(weekStart).setDate(weekStart.getDate() + 7));
					case '再来週': return new Date(new Date(weekStart).setDate(weekStart.getDate() + 14));
					case '4週間後': return new Date(new Date(weekStart).setDate(weekStart.getDate() + 28));
					case 'それ以降': return new Date(new Date(weekStart).setDate(weekStart.getDate() + 35));
					default: return null;
				}
			}
			if (zoom === 'month') {
				const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
				switch(block) {
					case '今月': return monthStart;
					case '来月': return new Date(new Date(monthStart).setMonth(monthStart.getMonth() + 1));
					case '再来月': return new Date(new Date(monthStart).setMonth(monthStart.getMonth() + 2));
					case '3ヶ月後': return new Date(new Date(monthStart).setMonth(monthStart.getMonth() + 3));
					case 'それ以降': return new Date(new Date(monthStart).setMonth(monthStart.getMonth() + 4));
					default: return null;
				}
			}
			return null;
		};

		const newDueDate = getNewDate(targetBlock, zoomLevel);
		if (!newDueDate) return;

		newDueDate.setHours(23, 59, 59, 999);

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

	// ★ コメント追加機能を実装
	const addComment = (targetId: string, content: string) => {
		if (!content.trim()) return;

		console.log('useProjectData: コメント追加開始:', { targetId, content });

		const newComment: Comment = {
			id: `comment-${Date.now()}`,
			content: content.trim(),
			createdAt: new Date().toISOString(),
		};

		console.log('useProjectData: 新しいコメント作成:', newComment);

		const newProjects = JSON.parse(JSON.stringify(projects));

		const findAndAddComment = (items: Project[]): boolean => {
			for (const item of items) {
				// プロジェクト自体がターゲットの場合
				if (item.id === targetId) {
					console.log('useProjectData: プロジェクトにコメント追加:', item.name);
					item.comments.push(newComment);
					return true;
				}
				// タスクがターゲットの場合
				const task = item.tasks.find(t => t.id === targetId);
				if (task) {
					console.log('useProjectData: タスクにコメント追加:', task.title);
					task.comments.push(newComment);
					return true;
				}
				// サブプロジェクトを再帰的に探索
				if (item.subProjects && findAndAddComment(item.subProjects)) {
					return true;
				}
			}
			return false;
		};

		const found = findAndAddComment(newProjects);
		console.log('useProjectData: コメント追加結果:', found);

		if (found) {
			setProjects(newProjects);
			console.log('useProjectData: プロジェクト状態更新完了');
		} else {
			console.warn('useProjectData: ターゲットが見つかりませんでした:', targetId);
		}
	};

	// setProjectsは直接渡さず、必要な操作関数を渡すように変更
	return { projects, toggleTaskCompletion, addTask, deleteTask, updateTask, addProject, addSubProject, updateProject, deleteProject, toggleSubtaskCompletion, addSubtask, deleteSubtask, updateTaskTimeBlock, addComment };
} 