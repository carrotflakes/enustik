import { select, call, put, takeEvery, takeLatest, delay, fork, all } from 'redux-saga/effects';
import {restore} from './events';

export function reducer(state=initialState, action) {
  return ({
  }[action.type] || (()=>state))(action);
}


const storageKey = 'enustik.autoSave';


export function* initialize() {
  yield delay(100);

  // restore
  const data = localStorage.getItem(storageKey);
  if (data) {
    try {
      const events = JSON.parse(data);
      yield put(restore(events));
      console.log('restored data from localStorage');
    } catch (e) {
      console.warn('data stored in localStorage is broken (ToT)');
    }
  }

  // auto save
  let savedEvents = yield select(state => state.events.events);
  while (true) {
    yield delay(1 * 60 * 1000);
    const events = yield select(state => state.events.events);
    if (events !== savedEvents) {
      localStorage.setItem(storageKey, JSON.stringify(events));
      console.log('auto saved to localStorage');
      savedEvents = events;
    }
  }
}

export function* rootSaga() {
  yield all([
    initialize()
  ]);
}
