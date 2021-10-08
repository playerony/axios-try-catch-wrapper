import { AxiosError, AxiosResponse } from 'axios';

interface IResultObject<T> {
  type: T;
  data: unknown;
  status: number | null;
}

type TResponseError = IResultObject<'response'>;

type TRequestError = IResultObject<'request'>;

type TErrorResult = IResultObject<'error'>;

type TDefaultError = IResultObject<'default'>;

const isAxiosError = (error: unknown): error is AxiosError =>
  !!error && typeof error === 'object' && (error as AxiosError).isAxiosError;

export const axiosTryCatchWrapper = async <TResponse = unknown>(
  axiosFunctionToExecute: () => Promise<AxiosResponse<TResponse>>,
): Promise<AxiosResponse<TResponse>> => {
  try {
    return await axiosFunctionToExecute();
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      if (error.response) {
        const { data, status } = error.response;

        throw { data, status, type: 'response' } as TResponseError;
      }

      if (error.request) {
        const { data, status } = error.request;

        throw { data, status, type: 'request' } as TRequestError;
      }
    }

    if (error instanceof Error) {
      throw {
        status: null,
        type: 'error',
        data: error.message,
      } as TErrorResult;
    }

    throw {
      data: error,
      status: null,
      type: 'default',
    } as TDefaultError;
  }
};
