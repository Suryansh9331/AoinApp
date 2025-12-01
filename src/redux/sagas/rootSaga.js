import { all } from 'redux-saga/effects';
import { loginWatcher } from './Saga.Login';
import { 
  fetchMerchantReelsWatcher, 
  fetchPublicReelsWatcher,
  likeReelWatcher,
  unlikeReelWatcher,
  shareReelWatcher,
} from './Saga.Reels';
// import { artistRegistrationWatcher } from './Saga.Artist';
// import { organisationRegistrationWatcher } from './Saga.Organisation';

export default function* rootSaga() {
  yield all([
    loginWatcher(),
    fetchMerchantReelsWatcher(),
    fetchPublicReelsWatcher(),
    likeReelWatcher(),
    unlikeReelWatcher(),
    shareReelWatcher(),
    // artistRegistrationWatcher(),
    // organisationRegistrationWatcher(),
    // Add other watchers here as needed
  ]);
}

