import axios from 'axios';
import {BASE_URL} from './Routes';

let authToken = null;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export const handleApiError = error => {
  if (error.response) {
    const {status, data} = error.response;
    const errorMessage = data?.message || data?.error || data?.errorMessage || `Request failed with status ${status}`;
    
    // Log full error for debugging
    console.log('API Error Response:', {
      status,
      data,
      message: errorMessage,
    });
    
    throw {
      type: 'response',
      status,
      message: errorMessage,
      data: data, // Include full data for more context
    };
  }

  if (error.request) {
    // Log more details for network errors
    console.log('Network error details:', {
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });
    throw {
      type: 'network',
      message: 'Network error, no response received. Please check your internet connection and server URL.',
      code: error.code,
    };
  }

  throw {
    type: 'unknown',
    message: error.message || 'Something went wrong',
  };
};

export const setAuthToken = token => {
  authToken = token || null;
};

export const getAuthToken = () => {
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const getData = async (endpoint, params = {}) => {
  try {
    const {data} = await apiClient.get(endpoint, {params});
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const postData = async (endpoint, body = {}) => {
  try {
    const {data} = await apiClient.post(endpoint, body);
    return data;
  } catch (error) {
    // Re-throw the error so saga can catch it properly
    throw handleApiError(error);
  }
};

export const putData = async (endpoint, body = {}) => {
  try {
    const {data} = await apiClient.put(endpoint, body);
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const deleteData = async (endpoint, body = {}) => {
  try {
    const {data} = await apiClient.delete(endpoint, {data: body});
    return data;
  } catch (error) {
    handleApiError(error);
    return null;
  }
};

export const uploadFormData = async (endpoint, formData, onProgress = null) => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      timeout: 60000, // 60 seconds timeout for uploads
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
