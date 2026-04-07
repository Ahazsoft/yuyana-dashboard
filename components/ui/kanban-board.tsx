"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Id = string | number;

export interface Column {
  id: Id;
  title: string;
}

export interface Task {
  id: Id;
  columnId: Id;
  content: React.ReactNode;
}

interface KanbanBoardProps {
  columns: Column[];
  tasks: Task[];
  onTaskMove: (updatedTasks: Task[]) => void;
}

export function KanbanBoard({ columns: initialColumns, tasks: initialTasks, onTaskMove }: KanbanBoardProps) {
  const [columns] = useState<Column[]>(initialColumns);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<Id | null>(null);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto p-4 min-h-[calc(100vh-12rem)]">
        {columns.map((col) => (
          <ColumnContainer
            key={col.id}
            column={col}
            tasks={tasks.filter((task) => task.columnId === col.id)}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
        }}
      >
        {activeId ? <TaskCard task={tasks.find((t) => t.id === activeId)!} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveId(event.active.id);
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          const newTasks = [...tasks];
          newTasks[activeIndex].columnId = tasks[overIndex].columnId;
          const reordered = arrayMove(newTasks, activeIndex, overIndex);
          requestAnimationFrame(() => onTaskMove(reordered));
          return reordered;
        }

        const reordered = arrayMove(tasks, activeIndex, overIndex);
        requestAnimationFrame(() => onTaskMove(reordered));
        return reordered;
      });
    }

    // Dropping a Task over a empty column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex].columnId = overId;
        const reordered = arrayMove(newTasks, activeIndex, activeIndex);
        requestAnimationFrame(() => onTaskMove(reordered));
        return reordered;
      });
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
  }
}

function ColumnContainer({ column, tasks }: { column: Column; tasks: Task[] }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const tasksIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className="bg-muted/50 rounded-xl w-[320px] flex flex-col shrink-0 border"
    >
      <div className="p-3 font-semibold border-b flex items-center justify-between">
        {column.title}
        <span className="bg-background text-foreground text-xs rounded-full px-2 py-1">
          {tasks.length}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-3 grow h-full">
        <SortableContext items={tasksIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function TaskCard({ task, isOverlay }: { task: Task; isOverlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { type: "Task", task },
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-primary rounded-xl h-[120px] bg-background"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-background p-3 rounded-xl border shadow-sm cursor-grab hover:border-primary/50 transition-colors ${
        isOverlay ? "rotate-2 scale-105" : ""
      }`}
    >
      {task.content}
    </div>
  );
}
