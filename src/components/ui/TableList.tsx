import { ReactNode, useState } from "react";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

export interface SelectAction {
  label: string;
  onClick: (selectedItems: any[]) => void;
  className?: string;
  icon?: ReactNode;
  disabled?: boolean; // ✅ Ajout de la propriété disabled
}

interface TableListProps<T> {
  items: T[];
  columns: Column<T>[];
  renderRow: (item: T, isSelected: boolean, onSelect: (item: T, isSelected: boolean) => void) => ReactNode;
  getId: (item: T) => string;
  onAction?: (item: T) => void;
  onSelectItems?: (selectedItems: T[]) => void;
  selectable?: boolean;
  emptyMessage?: string;
  actionColumn?: boolean;
  selectActions?: SelectAction[];
}

export default function TableList<T>({
  items,
  columns,
  renderRow,
  getId,
  onSelectItems,
  selectable = true,
  emptyMessage = "Aucun élément trouvé",
  actionColumn = true,
  selectActions,
}: TableListProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedItems = items.filter((i) => selectedIds.has(getId(i)));

  const handleSelectItem = (item: T, isSelected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      const id = getId(item);

      if (isSelected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }

      if (onSelectItems) {
        const selectedItems = items.filter((i) => newSet.has(getId(i)));
        onSelectItems(selectedItems);
      }

      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
      if (onSelectItems) onSelectItems([]);
    } else {
      const allIds = new Set(items.map(getId));
      setSelectedIds(allIds);
      if (onSelectItems) onSelectItems(items);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    if (onSelectItems) onSelectItems([]);
  };

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < items.length;
  const totalColumns = columns.length + (selectable ? 1 : 0) + (actionColumn ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {selectable && selectedIds.size > 0 && (
        <div className="bg-blue-50 border-t border-blue-100 px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-blue-700">
            {selectedIds.size} élément{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            {selectActions?.map((action, index) => (
              <button
                key={index}
                onClick={() => action.onClick(selectedItems)}
                disabled={action.disabled}
                className={`text-sm px-3 py-1 rounded transition-colors ${action.className || "bg-blue-600 text-white hover:bg-blue-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </button>
            ))}
            <button onClick={handleClearSelection} className="text-sm text-blue-700 hover:text-blue-900">
              Effacer
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <button onClick={handleSelectAll} className="p-1 rounded hover:bg-gray-200 transition-colors">
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors
                      ${isAllSelected ? "bg-primary border-primary" : "border-gray-400 hover:border-primary"}`}
                    >
                      {isAllSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isIndeterminate && <div className="w-3 h-0.5 bg-white" />}
                    </div>
                  </button>
                </th>
              )}

              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}

              {actionColumn && (
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((item) => renderRow(item, selectedIds.has(getId(item)), handleSelectItem))
            ) : (
              <tr>
                <td colSpan={totalColumns} className="py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
