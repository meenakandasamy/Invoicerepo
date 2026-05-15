import { create } from 'zustand';

interface resetFormState {
  reset: boolean;
  setResetForm: (value: boolean) => void;
}

export const useResetFormStore = create<resetFormState>((set) => ({
  reset: false,
  setResetForm: (value: boolean) => set({ reset: value }),
}));
