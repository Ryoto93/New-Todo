import './style.css';

export type ZoomLevel = 'day' | 'week' | 'month';

type Props = {
  currentZoom: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
};

export function ZoomControls({ currentZoom, onZoomChange }: Props) {
  return (
    <div className="zoom-controls">
      <button className={currentZoom === 'day' ? 'active' : ''} onClick={() => onZoomChange('day')}>日</button>
      <button className={currentZoom === 'week' ? 'active' : ''} onClick={() => onZoomChange('week')}>週</button>
      <button className={currentZoom === 'month' ? 'active' : ''} onClick={() => onZoomChange('month')}>月</button>
    </div>
  );
} 