import React from 'react';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import {SafeAreaProvider} from 'react-native-safe-area-context';
// import './global.css'; // Commented out for release build - NativeWind path issue

import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <Provider store={store}>
      <>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
        <Toast />
      </>
    </Provider>
  );
};

export default App;
