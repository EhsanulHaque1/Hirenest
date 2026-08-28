import React, { createContext, useContext, useState } from "react";

const AIContext = createContext();

export const useAI = () => useContext(AIContext);

export const AIProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AIContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AIContext.Provider>
  );
};
