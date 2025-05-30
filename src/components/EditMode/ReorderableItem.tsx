import { useState, useEffect, useRef } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { GripVertical, X } from 'lucide-react';
import type { AudioBook, DraggableInfo } from '../../types';

interface ReorderableItemProps {
  id: string;
  item: DraggableInfo;
  book: AudioBook;
  formatValue: (id: string, value: unknown) => string;
  onRemove: (id: string) => void;
  isDraggedOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function ReorderableItem({
  id,
  item,
  book,
  formatValue,
  onRemove,
  isDraggedOver,
  onDragOver,
  onDragLeave,
  onDrop
}: ReorderableItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      setIsHovered(false);
    }
  }, [isDragging]);

  return (
    <Reorder.Item
      key={id}
      value={id}
      ref={itemRef}
      className={`relative rounded-lg select-none border border-transparent ${
        isDraggedOver
          ? 'bg-blue-500/30 border-2 border-blue-400'
          : 'hover:border-indigo-500/30'
      }`}
      onMouseEnter={() => {
        if (!isDragging) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onMouseOver={(e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDragging && e.currentTarget === e.target) {
          setIsHovered(true);
        }
      }}
      onMouseOut={(e: React.MouseEvent) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
      layout="position"
      layoutId={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.2,
          ease: [0.23, 1, 0.32, 1]
        }
      }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.15 } }}
      whileHover={{
        scale: 1.015,
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        boxShadow: "0 2px 10px rgba(99, 102, 241, 0.25)",
        transition: {
          duration: 0.1,
          ease: "easeOut"
        }
      }}
      whileDrag={{
        scale: 1.05,
        boxShadow: "0px 10px 30px rgba(0,0,0,0.4)",
        zIndex: 100,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        cursor: "grabbing",
        borderRadius: "12px"
      }}
      dragListener={true}
      dragControls={dragControls}
      dragElastic={0.1}
      dragMomentum={false}
      dragTransition={{ bounceStiffness: 1000, bounceDamping: 35 }}
      onDragStart={() => {
        setIsDragging(true);
        setIsHovered(false);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setIsHovered(false);
        setTimeout(() => {
          if (itemRef.current) {
            const event = new MouseEvent('mouseleave', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            itemRef.current.dispatchEvent(event);
          }
        }, 0);
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ position: 'relative' }}
      onAnimationComplete={() => {
        setIsHovered(false);
        setIsDragging(false);
        
        if (window.getSelection) {
          window.getSelection()?.removeAllRanges();
        }
      }}
    >
      <div className="flex items-center gap-2 p-3 cursor-grab active:cursor-grabbing">
        <motion.div
          className="cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <GripVertical className="text-gray-400 hover:text-white transition-colors" size={16} />
        </motion.div>
        <div className="flex-1 select-none">
          <span className="font-medium text-white select-none">{item.label}: </span>
          <span className="text-gray-200 select-none">{formatValue(id, book[id as keyof AudioBook])}</span>
        </div>
        <motion.button
          onClick={() => onRemove(id)}
          className="opacity-100 transition-all text-red-500 hover:text-red-400 flex items-center justify-center select-none"
          aria-label="Remove item"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          initial={{ rotate: 0 }}
        >
          <X size={14} />
        </motion.button>
      </div>
    </Reorder.Item>
  );
}