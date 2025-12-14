"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface NotificationPanelContextType {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

const NotificationPanelContext = createContext<
  NotificationPanelContextType | undefined
>(undefined);

export const useNotificationPanel = () => {
  const context = useContext(NotificationPanelContext);
  if (!context) {
    throw new Error(
      "useNotificationPanel must be used within NotificationPanelProvider"
    );
  }
  return context;
};

export const NotificationPanelProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openPanel = () => setIsOpen(true);
  const closePanel = () => setIsOpen(false);
  const togglePanel = () => setIsOpen((prev) => !prev);

  return (
    <NotificationPanelContext.Provider
      value={{ isOpen, openPanel, closePanel, togglePanel }}
    >
      {children}
    </NotificationPanelContext.Provider>
  );
};
