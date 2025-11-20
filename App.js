import React from 'react';
import {Provider} from 'react-redux';
import { store } from './src/redux/store';
// import './global.css'; // Commented out for release build - NativeWind path issue

import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <Provider store={store}>
      <>
        <AppNavigator />
        <Toast />
      </>
    </Provider>
  );
};

export default App;
