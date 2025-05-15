import { QueryClient, QueryFunction } from "@tanstack/react-query";

export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (err) {
      // If response is not JSON, use status text as error message
      errorData = { message: res.statusText };
    }
    const errorMessage = errorData.message || res.statusText;
    const error = new Error(`${res.status}: ${JSON.stringify(errorData)}`) as any;
    error.status = res.status;
    error.message = errorMessage;
    error.details = errorData.details;
    error.data = errorData;
    throw error;
  }
}

export async function apiRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any) {
  const options: RequestInit = {
    method,
    credentials: 'include',
    headers: {},
  };

  if (data && method !== 'GET') {
    if (data instanceof FormData) {
      options.body = data;
      // Do not set Content-Type, browser will handle it
    } else {
      options.body = JSON.stringify(data);
      options.headers = { 'Content-Type': 'application/json' };
    }
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}${url}`, options);
  await throwIfResNotOk(res);
    
    // For DELETE requests that return 204 No Content
    if (res.status === 204) {
      return null;
    }
    
    try {
    return await res.json();
    } catch (err) {
      // If response is not JSON but request was successful, return null
      return null;
    }
  } catch (error) {
    console.error(`API ${method} request failed:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
