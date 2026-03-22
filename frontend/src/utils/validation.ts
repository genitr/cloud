export const validateLogin = (login: string): string | undefined => {
  if (!login.trim()) {
    return 'Логин обязателен';
  } else if (login.length < 4) {
    return 'Логин должен содержать минимум 4 символа';
  } else if (login.length > 20) {
    return 'Логин не должен превышать 20 символов';
  } else if (!/^[a-zA-Z0-9_]+$/.test(login)) {
    return 'Логин может содержать только буквы, цифры и _';
  }
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Пароль обязателен';
  } else if (password.length < 6) {
    return 'Пароль должен содержать минимум 6 символов';
  } else if (!/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
    return 'Пароль должен содержать цифру, строчную букву, заглавную букву и специальный символ';
  }
  return undefined;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) {
    return 'Подтвердите пароль';
  } else if (confirmPassword !== password) {
    return 'Пароли не совпадают';
  }
  return undefined;
};

export const validateEmail = (email: string): string | undefined => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email обязателен';
  } else if (!emailRegex.test(email)) {
    return 'Введите корректный email адрес';
  }
  return undefined;
};

export const validateFirstName = (firstName: string): string | undefined => {
  if (!firstName.trim()) {
    return 'Имя обязательно';
  } else if (firstName.length < 2) {
    return 'Введите корректное имя';
  } else if (!/^[а-яА-Яa-zA-Z\s-]+$/.test(firstName)) {
    return 'Имя может содержать только буквы, пробелы и дефис';
  }
  return undefined;
};

export const validateLastName = (lastName: string): string | undefined => {
  if (!lastName.trim()) {
    return 'Фамилия обязательна';
  } else if (lastName.length < 2) {
    return 'Введите корректную фамилию';
  } else if (!/^[а-яА-Яa-zA-Z\s-]+$/.test(lastName)) {
    return 'Фамилия может содержать только буквы, пробелы и дефис';
  }
  return undefined;
};