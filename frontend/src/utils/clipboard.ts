export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Современный метод
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback для старых браузеров и HTTP
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Делаем элемент невидимым
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};