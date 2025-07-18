import React, { useState, useCallback } from 'react';
import { DashboardWidget } from '@/types';
import { DraggableWidget } from './draggable-widget';
import { WidgetCreator } from './widget-creator';
import { dashboardService } from '@/lib/dashboard-service';

interface WidgetLayoutManagerProps {
  widgets: DashboardWidget[];
  onWidgetsChange: (widgets: DashboardWidget[]) => void;
  className?: string;
  gridCols?: number;
  gridRows?: number;
  enableEdit?: boolean;
}

export function WidgetLayoutManager({
  widgets,
  onWidgetsChange,
  className = '',
  gridCols = 4,
  gridRows = 6,
  enableEdit = true,
}: WidgetLayoutManagerProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  // Create a grid to track occupied positions
  const createGrid = useCallback(() => {
    const grid: (string | null)[][] = Array(gridRows)
      .fill(null)
      .map(() => Array(gridCols).fill(null));

    // Mark occupied positions
    widgets.forEach(widget => {
      const { x, y, w, h } = widget.position;
      for (let row = y; row < Math.min(y + h, gridRows); row++) {
        for (let col = x; col < Math.min(x + w, gridCols); col++) {
          if (row >= 0 && col >= 0) {
            grid[row][col] = widget.id;
          }
        }
      }
    });

    return grid;
  }, [widgets, gridCols, gridRows]);

  // Find next available position for a new widget
  const findAvailablePosition = useCallback(
    (width: number = 1, height: number = 1) => {
      const grid = createGrid();

      for (let y = 0; y <= gridRows - height; y++) {
        for (let x = 0; x <= gridCols - width; x++) {
          let canPlace = true;

          // Check if the area is free
          for (let row = y; row < y + height && canPlace; row++) {
            for (let col = x; col < x + width && canPlace; col++) {
              if (grid[row][col] !== null) {
                canPlace = false;
              }
            }
          }

          if (canPlace) {
            return { x, y };
          }
        }
      }

      // If no space found, place at the end
      return { x: 0, y: gridRows };
    },
    [createGrid, gridCols, gridRows]
  );

  // Handle widget position updates
  const handleWidgetPositionUpdate = useCallback(
    async (
      id: string,
      newPosition: { x: number; y: number; w: number; h: number }
    ) => {
      const updatedWidgets = widgets.map(widget =>
        widget.id === id ? { ...widget, position: newPosition } : widget
      );

      onWidgetsChange(updatedWidgets);

      // Persist changes
      try {
        await dashboardService.saveWidgetConfiguration(updatedWidgets);
      } catch (error) {
        console.error('Error saving widget configuration:', error);
      }
    },
    [widgets, onWidgetsChange]
  );

  // Handle widget drag end
  const handleWidgetDragEnd = useCallback(
    async (id: string, newPosition: { x: number; y: number }) => {
      const widget = widgets.find(w => w.id === id);
      if (!widget) return;

      const updatedPosition = {
        ...newPosition,
        w: widget.position.w,
        h: widget.position.h,
      };

      await handleWidgetPositionUpdate(id, updatedPosition);
      setDraggedWidget(null);
    },
    [widgets, handleWidgetPositionUpdate]
  );

  // Handle widget movement (arrow keys or buttons)
  const handleWidgetMove = useCallback(
    (id: string, direction: 'up' | 'down' | 'left' | 'right') => {
      const widget = widgets.find(w => w.id === id);
      if (!widget) return;

      const { x, y, w, h } = widget.position;
      let newX = x;
      let newY = y;

      switch (direction) {
        case 'up':
          newY = Math.max(0, y - 1);
          break;
        case 'down':
          newY = y + 1;
          break;
        case 'left':
          newX = Math.max(0, x - 1);
          break;
        case 'right':
          newX = Math.min(gridCols - w, x + 1);
          break;
      }

      handleWidgetPositionUpdate(id, { x: newX, y: newY, w, h });
    },
    [widgets, gridCols, handleWidgetPositionUpdate]
  );

  // Handle widget resize
  const handleWidgetResize = useCallback(
    (id: string, size: 'small' | 'medium' | 'large') => {
      const widget = widgets.find(w => w.id === id);
      if (!widget) return;

      const { x, y } = widget.position;
      let w = 1;
      let h = 1;

      switch (size) {
        case 'small':
          w = 1;
          h = 1;
          break;
        case 'medium':
          w = 2;
          h = 1;
          break;
        case 'large':
          w = 2;
          h = 2;
          break;
      }

      // Ensure the widget doesn't exceed grid boundaries
      const maxW = Math.min(w, gridCols - x);
      const maxH = Math.min(h, gridRows - y);

      handleWidgetPositionUpdate(id, { x, y, w: maxW, h: maxH });
    },
    [widgets, gridCols, gridRows, handleWidgetPositionUpdate]
  );

  // Handle widget removal
  const handleWidgetRemove = useCallback(
    async (id: string) => {
      const updatedWidgets = widgets.filter(w => w.id !== id);
      onWidgetsChange(updatedWidgets);

      // Persist changes
      try {
        await dashboardService.deleteWidget(id);
      } catch (error) {
        console.error('Error deleting widget:', error);
      }
    },
    [widgets, onWidgetsChange]
  );

  // Handle new widget creation
  const handleWidgetCreated = useCallback(
    async (newWidget: DashboardWidget) => {
      // Find available position
      const position = findAvailablePosition(
        newWidget.position.w,
        newWidget.position.h
      );
      const widgetWithPosition = {
        ...newWidget,
        position: { ...newWidget.position, ...position },
      };

      const updatedWidgets = [...widgets, widgetWithPosition];
      onWidgetsChange(updatedWidgets);
      setShowCreator(false);

      // Persist changes
      try {
        await dashboardService.saveWidgetConfiguration(updatedWidgets);
      } catch (error) {}
    },
    [widgets, onWidgetsChange, findAvailablePosition]
  );

  // Calculate grid template based on widgets
  const getGridStyle = () => {
    const maxRow = Math.max(
      ...widgets.map(w => w.position.y + w.position.h),
      gridRows
    );

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      gridTemplateRows: `repeat(${maxRow}, minmax(200px, auto))`,
      gap: '1rem',
      position: 'relative' as const,
    };
  };

  // Get widget style for grid positioning
  const getWidgetStyle = (widget: DashboardWidget) => ({
    gridColumn: `${widget.position.x + 1} / span ${widget.position.w}`,
    gridRow: `${widget.position.y + 1} / span ${widget.position.h}`,
  });

  return (
    <div className={`widget-layout-manager ${className}`}>
      {/* Edit mode toggle */}
      {enableEdit && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isEditMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isEditMode ? 'Finalizar Edición' : 'Editar Dashboard'}
            </button>

            {isEditMode && (
              <button
                onClick={() => setShowCreator(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Agregar Widget
              </button>
            )}
          </div>

          {isEditMode && (
            <div className="text-sm text-gray-500">
              Arrastra los widgets para reorganizar el dashboard
            </div>
          )}
        </div>
      )}

      {/* Widgets grid */}
      <div style={getGridStyle()} className="widgets-grid">
        {widgets.map(widget => (
          <div
            key={widget.id}
            style={getWidgetStyle(widget)}
            className={`widget-container ${
              draggedWidget === widget.id ? 'dragging' : ''
            }`}
          >
            <DraggableWidget
              widget={widget}
              onMove={handleWidgetMove}
              onResize={handleWidgetResize}
              onRemove={handleWidgetRemove}
              onDragEnd={handleWidgetDragEnd}
              onPositionUpdate={handleWidgetPositionUpdate}
              isDragDisabled={!isEditMode}
              gridSize={50} // Adjust based on your grid cell size
            />
          </div>
        ))}

        {/* Widget creator */}
        {showCreator && (
          <div
            className="widget-creator-container"
            style={{
              gridColumn: '1 / -1',
              gridRow: `${Math.max(...widgets.map(w => w.position.y + w.position.h), 0) + 1}`,
            }}
          >
            <WidgetCreator
              onWidgetCreated={handleWidgetCreated}
              className="h-full"
            />
            <button
              onClick={() => setShowCreator(false)}
              className="absolute top-2 right-2 p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              title="Cancelar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* CSS for drag and drop visual feedback */}
      <style jsx>{`
        .widget-container.dragging {
          opacity: 0.8;
          transform: scale(1.02);
          z-index: 1000;
        }

        .widgets-grid {
          min-height: 400px;
        }

        .widget-creator-container {
          position: relative;
        }

        :global(.dragging-widget) {
          cursor: grabbing !important;
        }

        :global(.dragging-widget *) {
          cursor: grabbing !important;
        }
      `}</style>
    </div>
  );
}
