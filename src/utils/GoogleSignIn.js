





import { ROUTES, GOOGLE_CLIENT_ID } from './Routes';
import axios from 'axios';

let GoogleSignin = null;

// Load Google Sign-In safely
try {
  GoogleSignin =
    require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
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
