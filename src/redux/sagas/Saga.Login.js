// saga.login.js
import { call, put, takeLatest } from "redux-saga/effects";

import {
  login_Request,
  login_Success,
  login_Failed,
} from "../slices/authSlice";
import { ROUTES } from "../../utils/Routes";
import { postData, setAuthToken } from "../../utils/APiCall";
import { setObject, AUTH_STORAGE_KEY, calculateTokenExpiry, DEFAULT_TOKEN_EXPIRY_DAYS } from "../../utils/MMKVStorage";

function* loginWorker(action) {
  console.log(action,'action');
  try {
 
    const payload = action.payload || {};
    const username = payload.email || payload.username || '';
    const password = payload.password || '';
    
    // Validate inputs
    if (!username || !password) {
      yield put(login_Failed('Username and password are required'));
      return;
    }
    
    const loginPayload = {
      username: username.trim(),
      password: password,
    };
    
    const response = yield call(postData, ROUTES.LOGIN, loginPayload);
    console.log('Login response:', response);
    
    
    if (!response) {
      yield put(login_Failed('Login failed. Please verify your credentials.'));
      return;
    }

    // Extract token from response - check multiple possible locations
    const token = 
      response?.data?.accessToken ?? 
      response?.data?.token ?? 
      response?.accessToken ?? 
      response?.token;
    
    if (!token) {
      console.log('Token not found in response:', response);
      yield put(login_Failed('Authentication token missing in response.'));
      return;
    }

    // Extract user data
    const userData = response?.data?.user ?? response?.data ?? response;

    // Set auth token for API calls
    setAuthToken(token);

    // Store auth data in MMKV for persistence with expiration
    const expiresIn = response?.expires_in || response?.data?.expires_in; // in seconds
    const expiresAt = calculateTokenExpiry(expiresIn);
    const authData = {
      token: token,
      userData: userData,
      timestamp: Date.now(),
      expiresAt: expiresAt,
      expiresIn: expiresIn || (DEFAULT_TOKEN_EXPIRY_DAYS * 24 * 60 * 60), // Store in seconds
    };
    setObject(AUTH_STORAGE_KEY, authData);
    console.log('Auth data stored in MMKV (from saga) with expiration:', new Date(expiresAt).toLocaleString());

    // Success case - pass the full response
    yield put(
      login_Success({
        data: userData,
        token: token,
      })
    );
  } catch (error) {
    console.log('Login saga error:', error);
    
    // Handle error object from handleApiError
    let errorMessage = 'An unexpected error occurred.';
    
    if (error && typeof error === 'object') {
      // Error object with type and message
      if (error.message) {
        errorMessage = error.message;
      } else if (error.type === 'network') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.type === 'response') {
        errorMessage = error.message || 'Login failed. Please verify your credentials.';
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    yield put(login_Failed(errorMessage));
  }
}

export function* loginWatcher() {
  yield takeLatest(login_Request.type, loginWorker);
}
