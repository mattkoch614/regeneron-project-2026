// Format numbers with k suffix for thousands (used in chart labels)
export const formatNumber = (value: number): string => {
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return value.toString();
};

// Format counts with commas (used in tooltips and table)
export const formatCount = (value: number): string => {
  return value.toLocaleString();
};

// Format quality score with 4 decimals (used in tooltips and table)
export const formatQuality = (value: number): string => {
  return value.toFixed(4);
};