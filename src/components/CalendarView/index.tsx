import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Project, Task } from '../../types';
import './style.css';

// Propsの型定義はそのまま
type Props = {
  projects: Project[];
  onTaskClick: (task: Task) => void;
};

// タスクとその親プロジェクト名を含む新しい型を定義
type TaskWithContext = Task & { parentProjectName: string };

// 全てのタスクを、親プロジェクト名付きで収集するヘルパー関数
const getAllTasksWithContext = (projects: Project[], parentName = ''): TaskWithContext[] => {
  let tasks: TaskWithContext[] = [];
  for (const project of projects) {
    const currentProjectName = parentName ? `${parentName} > ${project.name}` : project.name;
    project.tasks.forEach(task => {
      tasks.push({ ...task, parentProjectName: currentProjectName });
    });
    if (project.subProjects.length > 0) {
      tasks = tasks.concat(getAllTasksWithContext(project.subProjects, currentProjectName));
    }
  }
  return tasks;
};

export function CalendarView({ projects, onTaskClick }: Props) {
  const allTasks = getAllTasksWithContext(projects);
  
  const events = allTasks
    .filter(task => task.dueDate || task.period)
    .map(task => ({
      id: task.id,
      title: task.title,
      start: task.period ? task.period.start : task.dueDate!,
      end: task.period ? new Date(new Date(task.period.end).getTime() + 86400000).toISOString().split('T')[0] : undefined,
      allDay: true,
      extendedProps: { originalTask: task },
      className: task.isCompleted ? 'completed' : '' // ★ 完了タスクに印を付与！
    }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = (clickInfo: any) => {
    const originalTask = clickInfo.event.extendedProps.originalTask;
    if (originalTask) {
      onTaskClick(originalTask);
    }
  };

  return (
    <div className="calendar-view-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        locale="ja"
        businessHours={true}
        events={events}
        eventClick={handleEventClick}
        eventContent={(eventInfo) => (
          <div className="calendar-event-card">
            <div className="project-name">{eventInfo.event.extendedProps.originalTask.parentProjectName}</div>
            <div className="task-title">{eventInfo.event.title}</div>
          </div>
        )}
      />
    </div>
  );
} 