// Frontend/elios_FE/src/cvGenerator/state/useDesignerState.js
import { create } from "zustand";

export const useDesignerState = create((set) => ({
  elements: [],
  selectedElementId: null,

  // Add text element
  addTextElement: () =>
    set((state) => ({
      elements: [
        ...state.elements,
        {
          id: Date.now(),
          type: "text",
          text: "Double-click to edit",
          x: 100,
          y: 100,
          fontSize: 20,
          color: "#000",
          fontFamily: "Arial",
        },
      ],
    })),

  // Add image element
  addImageElement: (src) =>
    set((state) => ({
      elements: [
        ...state.elements,
        {
          id: Date.now(),
          type: "image",
          src,
          x: 150,
          y: 150,
          width: 200,
          height: 200,
        },
      ],
    })),

  // Update element properties (position, color, etc.)
  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),

  // Remove an element
  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: null,
    })),

  // Select an element
  selectElement: (id) => set({ selectedElementId: id }),
}));
