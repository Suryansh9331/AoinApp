import {configureStore} from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import reelReducer from './slices/reelSlice';
import rootSaga from './sagas/rootSaga';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    reels: reelReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: false, // Disable thunk since we're using saga
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

// Run root saga
sagaMiddleware.run(rootSaga);
