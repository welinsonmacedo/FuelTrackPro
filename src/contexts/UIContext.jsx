/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [modal, setModal] = useState(null);

  return (
    <UIContext.Provider value={{ loading, setLoading, alert, setAlert, modal, setModal }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
