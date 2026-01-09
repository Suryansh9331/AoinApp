export const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    } else {
      return date.toLocaleDateString([], {year: 'numeric', month: 'short', day: 'numeric'});
    }
  };

  export const CapitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  