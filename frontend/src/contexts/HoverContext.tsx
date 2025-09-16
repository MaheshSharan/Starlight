import React, { createContext, useContext, useState, useCallback } from 'react';

interface HoverContextType {
  activeCardId: string | null;
  setActiveCard: (cardId: string | null) => void;
  isCardActive: (cardId: string) => boolean;
}

const HoverContext = createContext<HoverContextType | undefined>(undefined);

export const HoverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const setActiveCard = useCallback((cardId: string | null) => {
    setActiveCardId(cardId);
  }, []);

  const isCardActive = useCallback((cardId: string) => {
    return activeCardId === cardId;
  }, [activeCardId]);

  return (
    <HoverContext.Provider value={{ activeCardId, setActiveCard, isCardActive }}>
      {children}
    </HoverContext.Provider>
  );
};

export const useHover = () => {
  const context = useContext(HoverContext);
  if (context === undefined) {
    throw new Error('useHover must be used within a HoverProvider');
  }
  return context;
};