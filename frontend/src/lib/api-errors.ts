import axios from 'axios';

interface ApiValidationIssue {
  message?: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: ApiValidationIssue[];
}

export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage;
  }

  return error.response?.data?.message || fallbackMessage;
};

export const getValidationMessages = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return [];
  }

  return (error.response?.data?.errors ?? [])
    .map((issue) => issue.message)
    .filter((message): message is string => Boolean(message));
};
