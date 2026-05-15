import { create } from 'zustand';

interface FormPageStore {
  pages: Record<string, any>;
  setPageField: (mainLabel: string, field: string, value: any) => void;
  setEntirePage: (mainLabel: string, data: Record<string, any>) => void;

  getPage: (mainLabel: string) => any;
  clearPage: (mainLabel: string) => void;
}

export const useFormPageStore = create<FormPageStore>((set, get) => ({
  pages: {},

  setPageField: (mainLabel, field, value) =>
    set((state) => ({
      pages: {
        ...state.pages,
        [mainLabel]: {
          ...(state.pages[mainLabel] || {}),
          [field]: value,
        },
      },
    })),

  setEntirePage: (mainLabel, data) =>
    set((state) => ({
      pages: {
        ...state.pages,
        [mainLabel]: data,
      },
    })),

  getPage: (mainLabel) => get().pages[mainLabel],

  clearPage: (mainLabel) =>
    set((state) => {
      const updated = { ...state.pages };
      delete updated[mainLabel];
      return { pages: updated };
    }),
}));
