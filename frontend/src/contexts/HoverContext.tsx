import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface HoverContextType {
  activeCardId: string | null;
  setActiveCard: (cardId: string | null) => void;
  isCardActive: (cardId: string) => boolean;
}

export const HoverContext = createContext<HoverContextType | undefined>(undefined);

export const HoverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const setActiveCard = useCallback((cardId: string | null) => {
    setActiveCardId(cardId);
  }, []);

  const isCardActive = useCallback((cardId: string) => {
    return activeCardId === cardId;
  }, [activeCardId]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    activeCardId,
    setActiveCard,
    isCardActive
  }), [activeCardId, setActiveCard, isCardActive]);

  return (
    <HoverContext.Provider value={contextValue}>
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