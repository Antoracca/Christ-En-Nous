// Mock pour react-async-hook sur web
// Ce fichier évite l'erreur de résolution sur le bundler web

export const useAsync = (asyncFunction, dependencies) => {
  return {
    loading: false,
    error: null,
    result: null,
  };
};

export const useAsyncCallback = (asyncFunction, dependencies) => {
  return {
    loading: false,
    error: null,
    result: null,
    execute: async () => {},
  };
};

export default { useAsync, useAsyncCallback };
