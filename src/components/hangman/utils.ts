const words = ['javascript', 'react', 'css', 'html'];

export const getRandomWord = () => {
  return words[Math.floor(Math.random() * words.length)].toUpperCase();
};
