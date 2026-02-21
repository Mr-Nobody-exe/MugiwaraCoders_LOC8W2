export const success = (data, message = 'Success', statusCode = 200) => ({
  success: true, statusCode, message, data,
});

export const error = (message = 'Error', statusCode = 500) => ({
  success: false, statusCode, message,
});

export const unauthorized = (message = 'Unauthorized') => error(message, 401);
export const forbidden = (message = 'Forbidden') => error(message, 403);
export const notFound = (message = 'Not found') => error(message, 404);