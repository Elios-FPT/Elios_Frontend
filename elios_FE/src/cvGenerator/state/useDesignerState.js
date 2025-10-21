// Frontend/elios_FE/src/cvGenerator/state/useDesignerState.js
import { create } from "zustand";
import { nanoid } from "nanoid";

export const useDesignerState = create((set, get) => ({
  pages: [{ id: 1, elements: [] }],
  currentPageId: 1,
  selectedElementId: null,

  // 🧠 Store copied element globally (not tied to page)
  copiedElement: null,

  // ➕ Add a new blank page
  addPage: () => {
    const newPage = { id: Date.now(), elements: [] };
    set((state) => ({
      pages: [...state.pages, newPage],
    }));
  },

  // 🔄 Switch current page (optionally keep selection)
  setCurrentPage: (pageId, keepSelection = false) =>
    set((state) => ({
      currentPageId: pageId,
      selectedElementId: keepSelection ? state.selectedElementId : null,
    })),

  // 🧱 Get current page
  getCurrentPage: () => {
    const { pages, currentPageId } = get();
    return pages.find((p) => p.id === currentPageId);
  },

  // 📝 Add text element to current page
  addTextElement: () =>
    set((state) => {
      const newText = {
        id: nanoid(),
        type: "text",
        text: "Double-click to edit",
        x: 100,
        y: 100,
        fontSize: 20,
        color: "#000",
        fontFamily: "Arial",
      };

      const pages = state.pages.map((p) =>
        p.id === state.currentPageId
          ? { ...p, elements: [...p.elements, newText] }
          : p
      );
      return { pages };
    }),

  // 🖼️ Add image element to current page
  addImageElement: (src) =>
    set((state) => {
      const newImage = {
        id: nanoid(),
        type: "image",
        src,
        x: 150,
        y: 150,
        width: 200,
        height: 200,
      };

      const pages = state.pages.map((p) =>
        p.id === state.currentPageId
          ? { ...p, elements: [...p.elements, newImage] }
          : p
      );
      return { pages };
    }),

  // ✏️ Update element in current page
  updateElement: (id, updates) =>
    set((state) => {
      const pages = state.pages.map((p) =>
        p.id === state.currentPageId
          ? {
              ...p,
              elements: p.elements.map((el) =>
                el.id === id ? { ...el, ...updates } : el
              ),
            }
          : p
      );
      return { pages };
    }),

  // 🗑️ Remove element
  removeElement: (id) =>
    set((state) => {
      const pages = state.pages.map((p) =>
        p.id === state.currentPageId
          ? { ...p, elements: p.elements.filter((el) => el.id !== id) }
          : p
      );
      return { pages, selectedElementId: null };
    }),

  // 🎯 Select element
  selectElement: (id) => set({ selectedElementId: id }),

  // 📋 Copy element (works globally now)
  copyElement: (id) => {
    const { pages } = get();
    // ✅ find element across ALL pages
    const element = pages.flatMap((p) => p.elements).find((el) => el.id === id);
    if (element) set({ copiedElement: { ...element } });
  },

  // 📎 Paste element (into current page, even if copied from another)
  pasteElement: () => {
    const { copiedElement, currentPageId, pages } = get();
    if (!copiedElement || !currentPageId) return;

    const newElement = {
      ...copiedElement,
      id: nanoid(),
      x: copiedElement.x + 20,
      y: copiedElement.y + 20,
    };

    const updatedPages = pages.map((p) =>
      p.id === currentPageId
        ? { ...p, elements: [...p.elements, newElement] }
        : p
    );

    set({ pages: updatedPages, selectedElementId: newElement.id });
  },

  // 🌀 Duplicate element (within same page)
  duplicateElement: (id) => {
    const currentPage = get().getCurrentPage();
    const element = currentPage?.elements.find((el) => el.id === id);
    if (!element) return;

    const newElement = {
      ...element,
      id: nanoid(),
      x: element.x + 20,
      y: element.y + 20,
    };

    set((state) => {
      const pages = state.pages.map((p) =>
        p.id === state.currentPageId
          ? { ...p, elements: [...p.elements, newElement] }
          : p
      );
      return { pages, selectedElementId: newElement.id };
    });
  },
}));
