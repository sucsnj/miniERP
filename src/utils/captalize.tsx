// Constante exportada com função.
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// Constante exportada com função.
export const capitalizeWords = (str: string) =>
  str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
