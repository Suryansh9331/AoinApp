export const BASE_URL = "http://10.40.43.220:5110";



export const ROUTES = Object.freeze({
  SEND_OTP: '/api/auth/phone/send-otp',
  SING_UP: '/api/auth/phone/verify-signup',
  USER_LOGIN: '/api/auth/phone/verify-login',
  MERCHANT_LOGIN: '/api/auth/login',
  UPLOAD_REEL: '/api/reels',
  PRODUCTS_AVAILABLE: '/api/reels/products/available',
  MERCHANT_MY_REELS: '/api/reels/merchant/my',
  PUBLIC_REELS: '/api/reels/public',
  LIKE_REEL: '/api/reels',
  UNLIKE_REEL: '/api/reels',
  SHARE_REEL: '/api/reels',
  DELETE_REEL: '/api/reels',
  EDIT_REEL: '/api/reels',
  FOLLOW_MERCHANT: '/api/merchants',
  UNFOLLOW_MERCHANT: '/api/merchants',
  REELBATCHDELET: '/api/reels/batch/delete',
  // Follow a merchant to see their reels in following feed
  // /api/merchants/{merchant_id}/follow
  // /api/merchants/{merchant_id}/unfollow

  // Get list of merchants the user follows.
  MERCHANT_FOLLOW_LIST: '/api/merchants/following',

  GET_TRENDING_LIST:'/api/reels/feed/trending',




  GOOGLE_LOGIN: 'https://api.aoinstore.com/api/auth/google',
});


export const GOOGLE_CLIENT_ID = '968020800951-t89qvbb6ne0nh8oh4cne6a3blqr6gs3l.apps.googleusercontent.com'