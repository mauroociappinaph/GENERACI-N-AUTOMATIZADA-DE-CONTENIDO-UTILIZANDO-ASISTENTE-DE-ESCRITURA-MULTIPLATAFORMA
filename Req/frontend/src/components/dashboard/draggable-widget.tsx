import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Widget } from './widget';
import { DashboardWidget } from '@/types';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  widget: DashboardWidget;
  onMove: (id: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  onResize: (id: string, size: 'small' | 'medium' | 'large') => void;
  onRemove: (id: string) => void;
  onDragEnd: (id: string, newPosition: { x: number; y: number }) => void;
  onPositionUpdate?: (id: string, position: { x: number; y: number; w: number; h: number }) => void;
  className?: string;
  gridSize?: number;
  isDragDisabled?: boolean;
}

export function DraggableWidget({
  widget,
  onMove,
  onResize,
  onRemove,
  onDragEnd,
  onPositionUpdate,
  className = '',
  gridSize = 20,
  isDragDisabled = false,
}: DraggableWidgetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Reset position when not dragging
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Skip if dragging is disabled
    if (isDragDisabled) return;

    // Only start drag with primary mouse button
    if (e.button !== 0) return;

    // Don't start drag if clicking on a control button
    if ((e.target as HTMLElement).closest('button')) return;

    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });

    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;

    setPosition({ x: dx, y: dy });
  }, [isDragging, startPos.x, startPos.y]);

  const calculateNewPosition = useCallback((clientX: number, clientY: number) => {
    // Calculate new position based on mouse position and drag offset
    const newX = Math.max(0, Math.round((clientX - dragOffset.x) / gridSize));
    const newY = Math.max(0, Math.round((clientY - dragOffset.y) / gridSize));

    return { x: newX, y: newY };
  }, [dragOffset.x, dragOffset.y, gridSize]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    setIsDragging(false);

    // Calculate new grid position
    const newPosition = calculateNewPosition(e.clientX, e.clientY);

    // Only update if position actually changed
    if (newPosition.x !== widget.position.x || newPosition.y !== widget.position.y) {
      // Update position using the new callback
      onDragEnd(widget.id, newPosition);

      // Also call position update if provided
      if (onPositionUpdate) {
        onPositionUpdate(widget.id, {
          ...newPosition,
          w: widget.position.w,
          h: widget.position.h,
        });
      }
    }
  }, [isDragging, calculateNewPosition, onDragEnd, onPositionUpdate, widget.id, widget.position]);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      // Add a class to the body to indicate dragging (for cursor changes)
      document.body.classList.add('dragging-widget');
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Remove the dragging class
      document.body.classList.remove('dragging-widget');
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('dragging-widget');
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-200 cursor-grab',
        isDragging && 'cursor-grabbing z-50 shadow-xl',
        className
      )}
      style={{
        transform: isDragging ? `translate(${position.x}px, ${position.y}px)` : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      <Widget
        widget={widget}
        onMove={onMove}
        onResize={onResize}
        onRemove={onRemove}
        isDragging={isDragging}
      />
    </div>
  );
}
