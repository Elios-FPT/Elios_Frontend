// file: elios_FE/src/resumeBuilder/utils/storage.js
/**
 * Saves the resume data to the browser's localStorage.
 * @param {object} data - The resume data object to save.
 */
export const saveToLocalStorage = (data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem('resumeData', serializedData);
  } catch (error) {
    console.error("Could not save resume data to localStorage", error);
  }
};

/**
 * Loads the resume data from localStorage.
 * @returns {object|null} The parsed resume data or null if not found.
 */
export const loadFromLocalStorage = () => {
  try {
    const serializedData = localStorage.getItem('resumeData');
    if (serializedData === null) {
      return undefined;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error("Could not load resume data from localStorage", error);
    return undefined;
  }
};

/**
 * Triggers a file download for the resume data as a JSON file.
 * @param {object} data - The resume data to export.
 */
export const exportToJson = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};