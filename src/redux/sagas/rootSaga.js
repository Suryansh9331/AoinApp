import { all } from 'redux-saga/effects';
import { loginWatcher } from './Saga.Login';
// import { artistRegistrationWatcher } from './Saga.Artist';
// import { organisationRegistrationWatcher } from './Saga.Organisation';

export default function* rootSaga() {
  yield all([
    loginWatcher(),
    // artistRegistrationWatcher(),
    // organisationRegistrationWatcher(),
    // Add other watchers here as needed
  ]);
}

