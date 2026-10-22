/**
 * Извлекает массив или строку ошибок из ответа RTK Query / Axios
 */
export const parseErpError = (err: any): string => {
  const serverData = err?.data;

  if (serverData && Array.isArray(serverData.message)) {
    return serverData.message.join('. ');
  } else if (serverData && typeof serverData.message === 'string') {
    return serverData.message;
  }

  return 'Произошла непредвиденная ошибка при записи данных в информационную базу.';
};
