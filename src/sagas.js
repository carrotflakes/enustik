import { fork } from 'redux-saga/effects';
import { rootSaga as events } from './modules/events';
import { rootSaga as player } from './modules/player';
import { rootSaga as autoSave } from './modules/autoSave';

export default function* saga() {
  yield fork(events);
  yield fork(player);
  yield fork(autoSave);
}
