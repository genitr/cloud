// Получение CSRF токена из cookies
export const getCSRFToken = (): string => {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    
    return cookieValue || '';
};

// Функция для создания заголовков с CSRF
export const getHeadersWithCSRF = (multipart: boolean = false): HeadersInit => {
    const headers: HeadersInit = {};
    
    if (!multipart) {
        headers['Content-Type'] = 'application/json';
    }
    
    const csrfToken = getCSRFToken();
    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }
    
    return headers;
};