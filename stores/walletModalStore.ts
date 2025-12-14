import { create } from "zustand";

type ModalStep =
  | "connect"
  | "success"
  | "username"
  | "creating"
  | "addressCreated"
  | "profile";

interface WalletModalState {
  // Modal state
  isOpen: boolean;
  currentStep: ModalStep;

  // Username state
  username: string;
  usernameStatus: "idle" | "checking" | "available" | "unavailable";

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setStep: (step: ModalStep) => void;
  setUsername: (username: string) => void;
  setUsernameStatus: (
    status: "idle" | "checking" | "available" | "unavailable"
  ) => void;
  resetModal: () => void;
}

export const useWalletModalStore = create<WalletModalState>((set) => ({
  // Initial state
  isOpen: false,
  currentStep: "connect",
  username: "",
  usernameStatus: "idle",

  // Actions
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  setStep: (step) => set({ currentStep: step }),
  setUsername: (username) => set({ username }),
  setUsernameStatus: (status) => set({ usernameStatus: status }),
  resetModal: () =>
    set({
      currentStep: "connect",
      username: "",
      usernameStatus: "idle",
    }),
}));
