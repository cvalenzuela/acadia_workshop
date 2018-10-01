export const rgbToHex = (r, g, b) => `0x${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

export const randomColor = () => `0x${Math.floor(Math.random()*16777215).toString(16)}`;