import { Filter, ArrowUpDown } from 'lucide-react';
import './style.css';

export type SortOption = 'default' | 'priority' | 'dueDate';
export type FilterOptions = { hideCompleted: boolean };

type Props = {
  sortOption: SortOption;
  filterOptions: FilterOptions;
  onSortChange: (option: SortOption) => void;
  onFilterChange: (options: FilterOptions) => void;
};

export function TaskFilterSort({ sortOption, filterOptions, onSortChange, onFilterChange }: Props) {
  return (
    <div className="task-controls">
      <div className="control-group">
        <ArrowUpDown size={16} />
        <select value={sortOption} onChange={(e) => onSortChange(e.target.value as SortOption)}>
          <option value="default">デフォルト</option>
          <option value="priority">優先度順</option>
          <option value="dueDate">期限が近い順</option>
        </select>
      </div>
      <div className="control-group">
        <Filter size={16} />
        <label>
          <input
            type="checkbox"
            checked={filterOptions.hideCompleted}
            onChange={(e) => onFilterChange({ ...filterOptions, hideCompleted: e.target.checked })}
          />
          完了済みを隠す
        </label>
      </div>
    </div>
  );
} 