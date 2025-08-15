// 型定義（暫定）。すでに型が存在する場合は上書きしてください。
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type StrategicImportance = 'S' | 'A' | 'B' | 'C';
export type Health = 'green' | 'yellow' | 'red';

export interface Subtask {
	id: string;
	title: string;
	isCompleted: boolean;
}

export interface Task {
	id: string;
	title: string;
	isCompleted: boolean;
	priority: Priority;
	dueDate: string | null;
	period: { start: string; end: string } | null;
	tags: string[];
	subtasks: Subtask[];
}

export interface Project {
	id: string;
	name: string;
	strategicImportance: StrategicImportance;
	health: Health;
	tasks: Task[];
	subProjects: Project[];
} 