import React from 'react';
import { motion } from 'framer-motion';
import type { AudioBook, DraggableInfo } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';

interface DraggableBubbleProps {
  item: DraggableInfo;
  book: AudioBook;
  position: { x: number; y: number };
  isDragging: boolean;
  showPreview: boolean;
  formatValue: (id: string, value: unknown) => string;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onDragEnd: () => void;
  index?: number;
}

export const DraggableBubble = React.forwardRef<HTMLDivElement, DraggableBubbleProps>(
  ({
    item,
    book,
    position,
    isDragging,
    showPreview,
    formatValue,
    onDragStart,
    onDragEnd,
    index = 0
  }, ref) => {
    const isMobile = useIsMobile();
  
  return (
    <motion.div
      ref={ref}
      initial={{
        left: `calc(50% + ${position.x * 0.1}px)`,
        top: `calc(50% + ${position.y * 0.1}px)`,
      }}
      animate={{
        left: `calc(50% + ${position.x}px)`,
        top: `calc(50% + ${position.y}px)`,
      }}
      transition={{
        duration: 1.2,
        ease: [0.34, 1.56, 0.64, 1], // Back easing for overshoot effect
        delay: index * 0.08
      }}
      className="absolute"
      style={{
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 100 : 10
      }}
    >
      <motion.div
        key={item.id}
        layoutId={`bubble-${item.id}`}
        draggable
        onDragStart={(e) => onDragStart(e as React.DragEvent, item.id)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        initial={{
          scale: 0.3,
          opacity: 0,
          filter: "blur(15px)",
        }}
        animate={{
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
        }}
        transition={{
          scale: { 
            type: "spring", 
            stiffness: 180, 
            damping: 20, 
            delay: index * 0.08,
          },
          opacity: { 
            duration: 0.5, 
            ease: [0.0, 0.0, 0.2, 1],
            delay: index * 0.08 + 0.1
          },
          filter: { 
            duration: 0.7, 
            ease: "easeOut", 
            delay: index * 0.08 
          }
        }}
      exit={{
        scale: 0.5,
        opacity: 0,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
          scale: { type: "spring", stiffness: 200, damping: 20 }
        }
      }}
        whileHover={{ 
          scale: 1.15,
          filter: "brightness(1.2)",
          boxShadow: "0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.3)"
        }}
        whileTap={{ scale: 0.95 }}
        className={`pointer-events-auto cursor-grab active:cursor-grabbing ${isMobile ? 'px-4 py-2' : 'px-6 py-3'} rounded-full 
          shadow-lg backdrop-blur-sm transition-all ${
            isDragging
              ? 'bg-gradient-to-r from-indigo-600/80 to-purple-700/80 scale-110 shadow-2xl opacity-60'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border border-white/10'
          } text-white font-medium ${isMobile ? 'text-sm' : ''}`}
        style={{
          boxShadow: isDragging 
            ? "0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(99, 102, 241, 0.6)" 
            : "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.label}</span>
          {showPreview && isDragging && (
            <span className="text-xs text-blue-200">
              {formatValue(item.id, book[item.id as keyof AudioBook])}
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});

DraggableBubble.displayName = 'DraggableBubble';