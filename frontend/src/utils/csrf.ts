export const getCSRFToken = (): string => {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    
    // Возвращаем строку, если null - возвращаем пустую строку
    return cookieValue || '';
};