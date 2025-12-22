// import {ROUTES, GOOGLE_CLIENT_ID} from './Routes';
// import {setAuthToken} from './APiCall';
// import axios from 'axios';

// let GoogleSignin = null;

// // Try to load Google Sign In package
// try {
//   GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
// } catch (e) {
//   console.log('Google Sign In package not installed');
// }

// /**
//  * Configure Google Sign In
//  */
// export const configureGoogleSignIn = () => {
//   if (GoogleSignin) {
//     try {
//       GoogleSignin.configure({
//         webClientId: GOOGLE_CLIENT_ID, // This should be the Web Client ID from Google Cloud Console
//         offlineAccess: true,
//         forceCodeForRefreshToken: true,
//       });
//       console.log('✅ Google Sign In configured with Client ID:', GOOGLE_CLIENT_ID);
//       console.log('📱 Package name should be: com.aoinapp');
//       console.log('🔑 SHA-1 fingerprint should be: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25');
//       console.log('⚠️  Make sure SHA-1 is added to Android OAuth 2.0 Client ID in Google Cloud Console');
//     } catch (error) {
//       console.log('❌ Error configuring Google Sign In:', error);
//       throw error;
//     }
//   }
// };

// /**
//  * Handle Google Sign In
//  */
// export const handleGoogleSignIn = async () => {
//   try {
//     if (!GoogleSignin) {
//       throw new Error('Google Sign In package not installed. Please install @react-native-google-signin/google-signin');
//     }

//     // Configure if not already configured
//     configureGoogleSignIn();

//     // Check if Google Play Services are available
//     await GoogleSignin.hasPlayServices();

//     // Sign in with Google
//     const userInfo = await GoogleSignin.signIn();
//     const idToken = userInfo.data?.idToken;

//     if (!idToken) {
//       throw new Error('Failed to get Google ID token');
//     }

//     // Send token to backend
//     const response = await authenticateWithGoogle(idToken);

//     return {
//       success: true,
//       data: response,
//     };
//   } catch (error) {
//     console.log('Google Sign In error:', error);
//     console.log('Error code:', error.code);
//     console.log('Error message:', error.message);
    
//     // Handle specific Google Sign In errors
//     if (error.code === 'SIGN_IN_CANCELLED') {
//       throw {message: 'Google Sign In was cancelled'};
//     } else if (error.code === 'IN_PROGRESS') {
//       throw {message: 'Google Sign In is already in progress'};
//     } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
//       throw {message: 'Google Play Services not available'};
//     } else if (error.code === 'DEVELOPER_ERROR' || error.message?.includes('DEVELOPER_ERROR')) {
//       // Most common cause: SHA-1 fingerprint not added to Google Cloud Console
//       throw {
//         message: 'DEVELOPER_ERROR: Please add SHA-1 fingerprint to Google Cloud Console. Run: cd android && .\\get-sha1.ps1',
//         code: 'DEVELOPER_ERROR',
//         help: '1. Run: cd android && .\\get-sha1.ps1\n2. Copy the SHA-1 fingerprint\n3. Go to Google Cloud Console > APIs & Services > Credentials\n4. Edit your Android OAuth 2.0 Client ID\n5. Add SHA-1 to "SHA certificate fingerprints"\n6. Rebuild the app',
//       };
//     }
    
//     throw error;
//   }
// };

// /**
//  * Send Google token to backend for authentication
//  */
// export const authenticateWithGoogle = async (googleToken) => {
//   try {
//     // Since GOOGLE_LOGIN is a full URL, use axios directly (not BASE_URL)
//     const response = await axios.post(ROUTES.GOOGLE_LOGIN, {
//       token: googleToken,
//       id_token: googleToken,
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
    
//     return response.data;
//   } catch (error) {
//     console.log('Google authentication error:', error);
    
//     if (error.response) {
//       const {status, data} = error.response;
//       const errorMessage = data?.message || data?.error || `Request failed with status ${status}`;
//       throw {
//         type: 'response',
//         status,
//         message: errorMessage,
//         data: data,
//       };
//     }
    
//     throw {
//       type: 'network',
//       message: error.message || 'Network error occurred',
//     };
//   }
// };





import { ROUTES, GOOGLE_CLIENT_ID } from './Routes';
import axios from 'axios';

let GoogleSignin = null;

// Load Google Sign-In safely
try {
  GoogleSignin =
    require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  console.log('❌ Google Sign In package not installed');
}

/**
 * Configure Google Sign In
 * (Call once before sign-in)
 */
export const configureGoogleSignIn = () => {
  if (!GoogleSignin) return;

  GoogleSignin.configure({
    webClientId: '968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com', // ✅ WEB CLIENT ID ONLY
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });

  console.log(
    '✅ Google Sign In configured with Web Client ID:',
    GOOGLE_CLIENT_ID,
  );
};

/**
 * Handle Google Sign In
 */
export const handleGoogleSignIn = async () => {
  try {
    if (!GoogleSignin) {
      throw new Error(
        'Google Sign In package not installed. Please install @react-native-google-signin/google-signin',
      );
    }

    // Ensure config is applied
    configureGoogleSignIn();

    // Ensure Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Ensure Play Services are available
await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

// Google sign-in
const result = await GoogleSignin.signIn();

if (result?.type !== 'success') {
  throw new Error('Google sign-in was not successful');
}

const idToken = result.data?.idToken;

if (!idToken) {
  throw new Error('Google did not return an ID token');
}

console.log('🪪 Google ID Token length:', idToken.length);


    // Send ONLY what backend expects
    const response = await authenticateWithGoogle(idToken);

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.log('❌ Google Sign In error:', error);

    // Handle known Google errors
    if (error.code === 'SIGN_IN_CANCELLED') {
      throw { message: 'Google Sign In cancelled' };
    }

    if (error.code === 'IN_PROGRESS') {
      throw { message: 'Google Sign In already in progress' };
    }

    if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      throw { message: 'Google Play Services not available' };
    }

    throw error;
  }
};

/**
 * Send Google ID token to backend
 */
export const authenticateWithGoogle = async idToken => {
  try {
    const response = await axios.post(
      ROUTES.GOOGLE_LOGIN,
      {
        // ✅ BACKEND CONTRACT (from Swagger)
        id_token: idToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log('❌ Google authentication error:', error);

    if (error.response) {
      const { status, data } = error.response;

      throw {
        type: 'response',
        status,
        message: data?.message || data?.error || 'Authentication failed',
        data,
      };
    }

    throw {
      type: 'network',
      message: error.message || 'Network error occurred',
    };
  }
};
