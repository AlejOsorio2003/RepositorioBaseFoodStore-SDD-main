// Tipos base compartidos para toda la aplicación
// Convención: prefijo I para interfaces, T para type aliases

export type UUID = string;

export type ISODateString = string;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
  errors?: Record<string, string[]>;
}
