import {call, put, takeLatest, select} from 'redux-saga/effects';
import {
  fetchMerchantReels_Request,
  fetchMerchantReels_Success,
  fetchMerchantReels_Failed,
  fetchPublicReels_Request,
  fetchPublicReels_Success,
  fetchPublicReels_Failed,
  likeReel_Request,
  likeReel_Success,
  likeReel_Failed,
  unlikeReel_Request,
  unlikeReel_Success,
  unlikeReel_Failed,
  shareReel_Request,
  shareReel_Success,
  shareReel_Failed,
} from '../slices/reelSlice';
import {ROUTES} from '../../utils/Routes';
import {getData, postData, setAuthToken} from '../../utils/APiCall';

// Map API response to component format
const mapReelData = (apiReel, currentUser = null) => {
  // Get username from current logged-in user
  const userInfo = currentUser?.data || currentUser || {};
  const firstName = userInfo.first_name || userInfo.firstName || '';
  const lastName = userInfo.last_name || userInfo.lastName || '';
  const fullName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || userInfo.name || '';
  const username =
    userInfo.username ||
    userInfo.user_name ||
    (firstName ? firstName.toLowerCase().replace(/\s+/g, '_') : '') ||
    apiReel.product?.product_name ||
    'Merchant';
  const userAvatar =
    userInfo.avatar ||
    userInfo.avatar_url ||
    userInfo.profile_picture ||
    userInfo.profile_image ||
    apiReel.product?.thumbnail_url ||
    'https://i.pravatar.cc/150?img=1';

  return {
    id: apiReel.reel_id?.toString() || apiReel.id?.toString(),
    reel_id: apiReel.reel_id,
    videoUrl: apiReel.video_url || apiReel.videoUrl,
    thumbnail: apiReel.thumbnail_url || apiReel.thumbnail,
    username: username,
    userAvatar: userAvatar,
    caption: apiReel.description || '',
    likes: apiReel.likes_count || 0,
    comments: 0, // API doesn't provide comments count
    shares: apiReel.shares_count || 0,
    views: apiReel.views_count || 0,
    isLiked: false, // Default to false, can be updated based on user interaction
    duration: apiReel.duration_seconds || 0,
    // Additional product info
    product: apiReel.product || null,
    product_id: apiReel.product_id,
    merchant_id: apiReel.merchant_id,
    approval_status: apiReel.approval_status,
    is_active: apiReel.is_active,
    is_visible: apiReel.is_visible,
    created_at: apiReel.created_at,
    updated_at: apiReel.updated_at,
  };
};

function* fetchMerchantReelsWorker(action) {
  try {
    const payload = action.payload || {};
    const page = payload.page || 1;
    const perPage = payload.per_page || 20;

    const currentUser = yield select(state => state.auth.data);

    let retryCount = 0;
    const maxRetries = 3;
    let response = null;

    while (retryCount < maxRetries) {
      try {
        response = yield call(getData, ROUTES.MERCHANT_MY_REELS, {
          page,
          per_page: perPage,
        });
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.log(`Fetch merchant reels retry ${retryCount}/${maxRetries}:`, error);
        
        if (retryCount >= maxRetries) {
          throw error; // Re-throw the last error
        }
        
        // Wait before retry (exponential backoff: 1s, 2s, 4s)
        yield call(delay, 1000 * Math.pow(2, retryCount - 1));
      }
    }

    if (response && response.status === 'success' && response.data) {
      
      const mappedReels = response.data.map((apiReel, index) => {
        const mapped = mapReelData(apiReel, currentUser);

        return mapped;
      });

     

      yield put(
        fetchMerchantReels_Success({
          reels: mappedReels,
          pagination: response.pagination || {
            page: 1,
            pages: 1,
            per_page: 20,
            total: 0,
          },
        }),
      );
    } else {
      yield put(
        fetchMerchantReels_Failed('Failed to fetch reels. Please try again.'),
      );
    }
  } catch (error) {
    console.log('Fetch merchant reels saga error:', error);

    let errorMessage = 'Failed to fetch reels. Please try again.';

    if (error?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error?.status === 404) {
      errorMessage = 'Reels not found.';
    } else if (error?.type === 'network' || error?.code === 'ERR_NETWORK') {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    yield put(fetchMerchantReels_Failed(errorMessage));
  }
}

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function* fetchMerchantReelsWatcher() {
  yield takeLatest(fetchMerchantReels_Request.type, fetchMerchantReelsWorker);
}


const mapPublicReelData = (apiReel, currentUser = null) => {
  
  const userInfo = currentUser?.data || currentUser || {};
  const currentUserId = userInfo.id || userInfo.user_id || userInfo.merchant_id;

  // Check if this reel belongs to the logged-in user
  const isOwnReel =
    currentUserId &&
    apiReel.merchant_id &&
    currentUserId.toString() === apiReel.merchant_id.toString();

  let username, userAvatar;

  if (isOwnReel) {
    // Show logged-in user's username for their own reels
    const firstName = userInfo.first_name || userInfo.firstName || '';
    const lastName = userInfo.last_name || userInfo.lastName || '';
    username =
      userInfo.username ||
      userInfo.user_name ||
      (firstName ? firstName.toLowerCase().replace(/\s+/g, '_') : 'user');
    userAvatar =
      userInfo.avatar ||
      userInfo.avatar_url ||
      userInfo.profile_picture ||
      userInfo.profile_image ||
      'https://i.pravatar.cc/150?img=1';
  } else {
    // Show creator's info (from API or product name)
    username =
      apiReel.merchant?.username ||
      apiReel.merchant?.user_name ||
      apiReel.merchant?.first_name ||
      apiReel.product?.product_name ||
      `merchant_${apiReel.merchant_id}` ||
      'User';
    userAvatar =
      apiReel.merchant?.avatar ||
      apiReel.merchant?.avatar_url ||
      apiReel.merchant?.profile_picture ||
      apiReel.product?.thumbnail_url ||
      'https://i.pravatar.cc/150?img=' + (apiReel.merchant_id || 1);
  }

  return {
    id: apiReel.reel_id?.toString() || apiReel.id?.toString(),
    reel_id: apiReel.reel_id,
    videoUrl: apiReel.video_url || apiReel.videoUrl,
    thumbnail: apiReel.thumbnail_url || apiReel.thumbnail,
    username: username,
    userAvatar: userAvatar,
    caption: apiReel.description || '',
    likes: apiReel.likes_count || 0,
    comments: apiReel.comments_count || 0,
    shares: apiReel.shares_count || 0,
    views: apiReel.views_count || 0,
    isLiked: apiReel.is_liked || false,
    duration: apiReel.duration_seconds || 0,
    // Additional info
    product: apiReel.product || null,
    product_id: apiReel.product_id,
    merchant_id: apiReel.merchant_id,
    approval_status: apiReel.approval_status,
    is_active: apiReel.is_active,
    created_at: apiReel.created_at,
    updated_at: apiReel.updated_at,
  };
};

function* fetchPublicReelsWorker(action) {
  try {
    const payload = action.payload || {};
    const page = payload.page || 1;
    const perPage = payload.per_page || 20;
    const merchantId = payload.merchant_id;

    // Get current logged-in user data from Redux
    const currentUser = yield select(state => state.auth.data);

    // Build query params
    const queryParams = {
      page,
      per_page: perPage,
    };
    
    // Add merchant_id if provided
    if (merchantId) {
      queryParams.merchant_id = merchantId;
    }

    const response = yield call(getData, ROUTES.PUBLIC_REELS, queryParams);

    if (response && response.status === 'success' && response.data) {
      // Map API response to component format with current user data
      const mappedReels = response.data.map((apiReel, index) => {
        const mapped = mapPublicReelData(apiReel, currentUser);
      
        return mapped;
      });

     
      yield put(
        fetchPublicReels_Success({
          reels: mappedReels,
          pagination: response.pagination || {
            page: 1,
            pages: 1,
            per_page: 20,
            total: 0,
          },
        }),
      );
    } else {
      yield put(
        fetchPublicReels_Failed('Failed to fetch reels. Please try again.'),
      );
    }
  } catch (error) {
    console.log('Fetch public reels saga error:', error);

    let errorMessage = 'Failed to fetch reels. Please try again.';

    if (error?.status === 401) {
      errorMessage = 'Unauthorized. Please login again.';
    } else if (error?.status === 404) {
      errorMessage = 'Reels not found.';
    } else if (error?.type === 'network') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    yield put(fetchPublicReels_Failed(errorMessage));
  }
}

export function* fetchPublicReelsWatcher() {
  yield takeLatest(fetchPublicReels_Request.type, fetchPublicReelsWorker);
}

// =========================================
// 🔥 LIKE REEL SAGA
// =========================================
function* likeReelWorker(action) {
  try {
    const reelId = action.payload?.reelId;

    if (!reelId) {
      yield put(likeReel_Failed({reelId, message: 'Reel ID is required'}));
      return;
    }

    // Get token from Redux state and set it
    const token = yield select(state => state.auth.token);
    if (token) {
      setAuthToken(token);
    } else {
      yield put(
        likeReel_Failed({
          reelId,
          message: 'Authentication required. Please login again.',
        }),
      );
      return;
    }

  

    // Call API
    const endpoint = `${ROUTES.LIKE_REEL}/${reelId}/like`;
    const response = yield call(postData, endpoint, {});

  

    if (response && response.status === 'success') {
      yield put(likeReel_Success({reelId, response}));
    } else {
      yield put(likeReel_Failed({reelId, message: 'Failed to like reel'}));
    }
  } catch (error) {
    console.log('Like reel saga error:', error);
    const reelId = action.payload?.reelId;
    yield put(
      likeReel_Failed({
        reelId,
        message: error?.message || 'Failed to like reel',
      }),
    );
  }
}

export function* likeReelWatcher() {
  yield takeLatest(likeReel_Request.type, likeReelWorker);
}

// =========================================
// 🔥 UNLIKE REEL SAGA
// =========================================
function* unlikeReelWorker(action) {
  try {
    const reelId = action.payload?.reelId;

    if (!reelId) {
      yield put(unlikeReel_Failed({reelId, message: 'Reel ID is required'}));
      return;
    }

    // Get token from Redux state and set it
    const token = yield select(state => state.auth.token);
    if (token) {
      setAuthToken(token);
    } else {
      yield put(
        unlikeReel_Failed({
          reelId,
          message: 'Authentication required. Please login again.',
        }),
      );
      return;
    }

  

    // Call API
    const endpoint = `${ROUTES.UNLIKE_REEL}/${reelId}/unlike`;
    const response = yield call(postData, endpoint, {});

   

    if (response && response.status === 'success') {
      yield put(unlikeReel_Success({reelId, response}));
    } else {
      yield put(unlikeReel_Failed({reelId, message: 'Failed to unlike reel'}));
    }
  } catch (error) {
    console.log('Unlike reel saga error:', error);
    const reelId = action.payload?.reelId;
    yield put(
      unlikeReel_Failed({
        reelId,
        message: error?.message || 'Failed to unlike reel',
      }),
    );
  }
}

export function* unlikeReelWatcher() {
  yield takeLatest(unlikeReel_Request.type, unlikeReelWorker);
}

// =========================================
// 🔥 SHARE REEL SAGA
// =========================================
function* shareReelWorker(action) {
  try {
    const reelId = action.payload?.reelId;

    if (!reelId) {
      yield put(shareReel_Failed({reelId, message: 'Reel ID is required'}));
      return;
    }

    // Get token from Redux state and set it
    const token = yield select(state => state.auth.token);
    if (token) {
      setAuthToken(token);
    } else {
      yield put(
        shareReel_Failed({
          reelId,
          message: 'Authentication required. Please login again.',
        }),
      );
      return;
    }

  

    // Call API
    const endpoint = `${ROUTES.SHARE_REEL}/${reelId}/share`;
    const response = yield call(postData, endpoint, {});

   
    if (response && response.status === 'success') {
      yield put(shareReel_Success({reelId, response}));
    } else {
      yield put(shareReel_Failed({reelId, message: 'Failed to share reel'}));
    }
  } catch (error) {
    console.log('Share reel saga error:', error);
    const reelId = action.payload?.reelId;
    yield put(
      shareReel_Failed({
        reelId,
        message: error?.message || 'Failed to share reel',
      }),
    );
  }
}

export function* shareReelWatcher() {
  yield takeLatest(shareReel_Request.type, shareReelWorker);
}
