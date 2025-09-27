/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";

export function returnParams<T>(params: T): { params: Promise<T> } {
  return {
    params: Promise.resolve(params),
  };
}

export const createRequest = (body: any, path: string) => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  return new NextRequest(`http://localhost:3000/api/${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
};