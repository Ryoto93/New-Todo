import type { Project } from '../types/index.ts';

export const initialData: Project[] = [
	{
		id: 'proj-1',
		name: '新製品ローンチプロジェクト',
		strategicImportance: 'S',
		health: 'green',
		tasks: [
			{ id: 'task-1', title: '緊急レビュー', isCompleted: false, priority: 'P1', dueDate: new Date('2025-08-15T15:00:00').toISOString(), period: null, tags: ['#品質管理', '#緊急'], subtasks: [] },
			{ id: 'task-2', title: 'マーケティング資料作成', isCompleted: false, priority: 'P2', dueDate: null, period: { start: new Date('2025-08-16').toISOString(), end: new Date('2025-08-18').toISOString() }, tags: ['#マーケティング'], subtasks: [] },
			// テスト用：今日のP1タスク
			{ id: 'task-urgent-today', title: '🔥 今日完了必須の緊急タスク', isCompleted: false, priority: 'P1', dueDate: new Date().toISOString(), period: null, tags: ['#緊急', '#今日完了'], subtasks: [] },
			// テスト用：明日のP1タスク
			{ id: 'task-urgent-tomorrow', title: '⚡ 明日の重要会議準備', isCompleted: false, priority: 'P1', dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), period: null, tags: ['#重要', '#会議'], subtasks: [] },
		],
		subProjects: [
			{
				id: 'subproj-1',
				name: 'Webサイト開発',
				strategicImportance: 'A',
				health: 'yellow',
				tasks: [
					{ id: 'task-3', title: 'トップページデザインFIX', isCompleted: true, priority: 'P1', dueDate: new Date('2025-08-14').toISOString(), period: null, tags: ['#プロダクト開発'], subtasks: [] },
					{ id: 'task-4', title: 'バックエンドAPI実装', isCompleted: false, priority: 'P2', dueDate: new Date('2025-08-22').toISOString(), period: null, tags: ['#システム構築'], subtasks: [] },
				],
				subProjects: []
			}
		],
	},
	{
		id: 'proj-2',
		name: 'プライベート',
		strategicImportance: 'C',
		health: 'green',
		tasks: [
			{ id: 'task-5', title: '週末の買い物', isCompleted: false, priority: 'P3', dueDate: new Date('2025-08-16').toISOString(), period: null, tags: ['#買い物', '#家事'], subtasks: [
				{ id: 'subtask-1', title: '牛乳', isCompleted: false },
				{ id: 'subtask-2', title: 'パン', isCompleted: false },
			] },
		],
		subProjects: [],
	}
]; 