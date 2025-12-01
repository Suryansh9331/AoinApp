export const BASE_URL = "http://10.247.126.132:5110";


export const ROUTES = Object.freeze({
  SEND_OTP: '/api/auth/phone/send-otp',
  SING_UP: '/api/auth/phone/verify-signup',
  USER_LOGIN: '/api/auth/phone/verify-login',
  MERCHANT_LOGIN: '/api/auth/login',
  UPLOAD_REEL: '/api/reels',
  PRODUCTS_AVAILABLE: '/api/reels/products/available',
  MERCHANT_MY_REELS: '/api/reels/merchant/my',
  PUBLIC_REELS: '/api/reels/public',
  LIKE_REEL: '/api/reels', // Will append /{reel_id}/like
  UNLIKE_REEL: '/api/reels', // Will append /{reel_id}/unlike
  SHARE_REEL: '/api/reels', // Will append /{reel_id}/share

  GOOGLE_LOGIN: 'https://api.aoinstore.com/api/auth/google',
});


export const GOOGLE_CLIENT_ID='968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com'