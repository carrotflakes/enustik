import moducks from './moducks';
import { resolution } from '../consts';

const initialState = {
  events: [{id: 1, type: 'note', notenum: 60, start: 0 * resolution, duration: resolution}],
  eventId: 2,
};

export const {
  events, sagas,
  addNote
} = moducks.createModule('events', {
  ADD_NOTE: {
    reducer(state, {payload}) {
      const event = {
        ...payload,
        id: state.eventId,
        type: 'note'
      };
      return {
        events: [...state.events, event],
        eventId: state.eventId + 1
      }
    }
  }
}, initialState);
