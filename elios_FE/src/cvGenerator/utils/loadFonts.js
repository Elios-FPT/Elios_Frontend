// Frontend/elios_FE/src/cvGenerator/utils/loadFonts.js
import WebFont from "webfontloader";
import { FONT_LIST } from "./fonts";

export const loadAllFonts = () => {
  WebFont.load({
    google: {
      families: FONT_LIST,
    },
    timeout: 4000, // fallback if Google Fonts take too long
    active: () => console.log("✅ All Google fonts loaded"),
    inactive: () => console.warn("⚠️ Some fonts failed to load"),
  });
};
