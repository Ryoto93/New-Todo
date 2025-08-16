import './style.css';

export type ViewMode = 'flow' | 'calendar';

type Props = {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
};

export function ViewSwitcher({ currentView, onViewChange }: Props) {
  return (
    <div className="view-switcher">
      <button
        className={currentView === 'flow' ? 'active' : ''}
        onClick={() => onViewChange('flow')}
      >
        Flow Canvas
      </button>
      <button
        className={currentView === 'calendar' ? 'active' : ''}
        onClick={() => onViewChange('calendar')}
      >
        Calendar
      </button>
    </div>
  );
} 