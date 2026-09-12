import React from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ID_ALL } from '../utils';

export const TagsPanel: React.FC = () => {
  const { state, dispatch } = useStore();
  const { isTagsPanelOpen, searchQuery, activeFolderId } = state.ui;

  const allTags = new Set<string>();
  
  // 1. Add Card Tags
  state.db.cards.forEach(c => c.tags.forEach(t => allTags.add(t)));

  // 2. Add Folder Tags (dynamically generated)
  // We exclude the System folder and create tags like #FolderName (removing spaces)
  state.db.folders.forEach(f => {
      if (f.id !== ID_ALL) {
          const folderTag = `#${f.name.replace(/\s+/g, '')}`;
          allTags.add(folderTag);
      }
  });

  const uniqueTags = Array.from(allTags).sort();

  const handleTagClick = (tag: string) => {
      // Auto switch to All Cards if on Home so we can search globally
      if (activeFolderId === null) {
          dispatch({ type: 'SET_ACTIVE_FOLDER', payload: ID_ALL });
      }

      const cleanTag = tag; // Keep the # for folder detection in App.tsx
      const currentQuery = searchQuery.trim();
      
      // If query is not empty and starts with #, assume tag mode
      if (currentQuery.startsWith('#')) {
          const activeTags = currentQuery.split(' ').map(t => t.trim());
          
          // Check loose equality (case insensitive)
          const tagExists = activeTags.some(t => t.toLowerCase() === cleanTag.toLowerCase());

          if (tagExists) {
              // Remove tag
              const newTags = activeTags.filter(t => t.toLowerCase() !== cleanTag.toLowerCase());
              dispatch({ type: 'SET_SEARCH_QUERY', payload: newTags.join(' ') });
          } else {
              // Append tag
              dispatch({ type: 'SET_SEARCH_QUERY', payload: `${currentQuery} ${cleanTag}` });
          }
      } else {
          // If text search or empty, replace with single tag
          dispatch({ type: 'SET_SEARCH_QUERY', payload: cleanTag });
      }
  };

  return (
    <AnimatePresence>
        {isTagsPanelOpen && (
            <motion.div 
                initial={{ opacity: 0, y: -5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full right-0 mt-3 w-[280px] sm:w-[320px] max-h-[300px] overflow-y-auto bg-bg-panel border border-zinc-700 rounded-xl shadow-2xl p-4 z-50 flex flex-wrap gap-2"
            >
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-bg-panel border-t border-l border-zinc-700 rotate-45" />

                <div className="relative z-10 w-full flex flex-wrap gap-2">
                    {uniqueTags.length === 0 ? (
                        <span className="text-gray-500 text-sm w-full text-center py-2">Sin etiquetas creadas.</span>
                    ) : (
                        uniqueTags.map(tag => {
                            const isActive = searchQuery.toLowerCase().includes(tag.toLowerCase());
                            // Style distinction: Folder tags in a different shade/border?
                            // For now keeping consistent, but logic exists if needed.
                            return (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                                        isActive
                                            ? 'bg-primary text-black border-primary font-bold shadow-lg shadow-primary/20'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary hover:text-white'
                                    }`}
                                >
                                    {tag}
                                </button>
                            );
                        })
                    )}
                </div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};