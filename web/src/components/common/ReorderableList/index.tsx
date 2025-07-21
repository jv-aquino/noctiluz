import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
  } from "@dnd-kit/core";
  import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
  } from "@dnd-kit/sortable";
  import { CSS } from "@dnd-kit/utilities";
  import { GripVertical } from "lucide-react";
  import React from "react";
  
  interface SortableItemProps {
    id: string;
    children: React.ReactNode;
  }
  
  export function SortableItem({ id, children }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };
    return (
      <div ref={setNodeRef} style={style} className="flex items-center">
        <div {...attributes} {...listeners} className="cursor-grab p-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-grow">{children}</div>
      </div>
    );
  }
  
  interface ReorderableListProps {
    items: { id: string; [key: string]: any }[];
    onOrderChange: (newOrder: string[]) => void;
    renderItem: (item: any) => React.ReactNode;
    className?: string;
  }
  
  export function ReorderableList({ items, onOrderChange, renderItem, className }: ReorderableListProps) {
    const sensors = useSensors(useSensor(PointerSensor));
    const itemIds = items.map(i => i.id);
  
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = itemIds.indexOf(active.id as string);
        const newIndex = itemIds.indexOf(over.id as string);
        const newOrder = arrayMove(itemIds, oldIndex, newIndex);
        onOrderChange(newOrder);
      }
    };
  
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className={className}>
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                {renderItem(item)}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  } 