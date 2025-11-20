// saga.login.js
import { call, put, takeLatest } from "redux-saga/effects";

import {
  login_Request,
  login_Success,
  login_Failed,
} from "../slices/authSlice";
import { ROUTES } from "../../utils/Routes";
import { postData } from "../../utils/APiCall";

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
    
    console.log('Login payload being sent:', { ...loginPayload, password: '***' });
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
