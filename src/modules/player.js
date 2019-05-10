import { select, call, put, takeEvery, takeLatest, delay, fork, all } from 'redux-saga/effects';
import { resolution } from '../consts';
import events from './events';
import { getDevices } from '../midiOutput';

const bpm = 120;

const PLAY = 'enustik/player/PLAY';
const STOP = 'enustik/player/STOP';

export function play() {
  return {
    type: PLAY
  };
}

export function stop() {
  return {
    type: STOP
  };
}


const initialState = {
  playing: false
};

export function reducer(state=initialState, action) {
  return ({
    [PLAY]() {
      return {
        ...state,
        playing: true
      };
    },
    [STOP]() {
      return {
        ...state,
        playing: false
      };
    },
  }[action.type] || (()=>state))(action);
}


export function* handlePlay(action) {
  const devices = yield call(getDevices);
  const device = devices[0];
  const startTime = Date.now();
  let time = 0;
  while (true) {
    const {events} = yield select(state=>state.events);
    const time_ = (Date.now() - startTime) / 1000 / 60 * bpm * resolution;
    for (const event of events) {
      const {start, duration} = event;
      const end = start + duration;
      if (time <= start && start < time_) {
        device.send([0x90, event.notenum, 100]);
      }
      if (time <= end && end < time_) {
        device.send([0x80, event.notenum, 100]);
      }
    }
    time = time_;
    yield delay(100);
    const {playing} = yield select(state=>state.player);
    if (!playing) {
      break;
    }
  }
}

export function* watchPlay() {
  yield takeLatest(PLAY, handlePlay);
}

export function* rootSaga() {
  yield all([
    watchPlay()
  ]);
}
