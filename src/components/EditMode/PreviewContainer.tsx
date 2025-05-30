import { forwardRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import type { AudioBook, DraggableInfo } from '../../types';
import { ReorderableItem } from './ReorderableItem';

interface PreviewContainerProps {
  book: AudioBook;
  activeContainer: string[];
  draggables: DraggableInfo[];
  formatValue: (id: string, value: unknown) => string;
  onReorder: (newOrder: string[]) => void;
  onRemove: (id: string) => void;
  onDrop: (e: React.DragEvent) => void;
  draggedOverSlot: number | null;
  isDraggingFromContainer: boolean;
  onDragOver: (e: React.DragEvent, slotIndex: number) => void;
  onDragLeave: () => void;
  onSlotDrop: (e: React.DragEvent, slotIndex: number) => void;
}

export const PreviewContainer = forwardRef<HTMLDivElement, PreviewContainerProps>(
  (
    {
      book,
      activeContainer,
      draggables,
      formatValue,
      onReorder,
      onRemove,
      onDrop,
      draggedOverSlot,
      isDraggingFromContainer,
      onDragOver,
      onDragLeave,
      onSlotDrop
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className="preview-container w-[90vw] max-w-[500px] aspect-square bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-600/50 z-40"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          borderColor: activeContainer.length === 0 ? "rgba(75, 85, 99, 0.5)" : "rgba(75, 85, 99, 0.3)"
        }}
        transition={{ 
          duration: 0.4, 
          ease: "easeOut",
          borderColor: { duration: 0.2 }
        }}
        whileHover={{ 
          borderColor: "rgba(99, 102, 241, 0.4)",
          transition: { duration: 0.2 }
        }}
      >
        <motion.div className="relative w-full h-full">
          <img
            src={book.coverArt}
            alt={book.bookTitle}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-lg">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Reorder.Group
                axis="y"
                values={activeContainer}
                layoutScroll={false}
                onReorder={(newOrder) => {
                  onReorder(newOrder);
                  
                  const allItems = document.querySelectorAll('.select-none');
                  allItems.forEach(item => {
                    if (item instanceof HTMLElement) {
                      const mouseLeaveEvent = new MouseEvent('mouseleave', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                      });
                      item.dispatchEvent(mouseLeaveEvent);
                    }
                  });
                  
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                  
                  if (window.getSelection) {
                    window.getSelection()?.removeAllRanges();
                  }
                }}
                className="space-y-0.5"
                style={{ outline: 'none' }}
              >
                <AnimatePresence>
                  {activeContainer.map((id, index) => {
                    const item = draggables.find(d => d.id === id);
                    if (!item) return null;
                    
                    return (
                      <ReorderableItem
                        key={id}
                        id={id}
                        item={item}
                        book={book}
                        formatValue={formatValue}
                        onRemove={onRemove}
                        isDraggedOver={draggedOverSlot === index && !isDraggingFromContainer}
                        onDragOver={(e) => onDragOver(e, index)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onSlotDrop(e, index)}
                      />
                    );
                  })}
                </AnimatePresence>
              </Reorder.Group>
              
              {activeContainer.length < 5 && (
                <motion.div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-all mt-2 ${
                    draggedOverSlot === activeContainer.length 
                      ? 'border-blue-400 bg-blue-500/20 text-blue-300' 
                      : 'border-gray-600 text-gray-500'
                  }`}
                  onDragOver={(e) => onDragOver(e, activeContainer.length)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onSlotDrop(e, activeContainer.length)}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: "auto",
                    scale: draggedOverSlot === activeContainer.length ? 1.02 : 1,
                    backgroundColor: draggedOverSlot === activeContainer.length 
                      ? "rgba(59, 130, 246, 0.2)" 
                      : "rgba(0, 0, 0, 0)"
                  }}
                  transition={{ 
                    height: { duration: 0.3, ease: "easeOut" },
                    scale: { duration: 0.2, ease: "easeOut" },
                    backgroundColor: { duration: 0.2 }
                  }}
                >
                  <motion.span
                    animate={{
                      scale: draggedOverSlot === activeContainer.length ? [1, 1.05, 1] : 1
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: draggedOverSlot === activeContainer.length ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                  >
                    {draggedOverSlot === activeContainer.length ? '✓ Drop here' : '⊕ Drag element here'}
                  </motion.span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);

PreviewContainer.displayName = 'PreviewContainer';