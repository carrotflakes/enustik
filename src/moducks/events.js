import moducks from './moducks';
import { resolution } from '../consts';

const initialState = {
  events: [{id: 1, type: 'note', notenum: 60, start: 0 * resolution, duration: resolution}],
  eventId: 2,
};

export const {
  events, sagas,
  addNote, removeEvent, moveNote
} = moducks.createModule('events', {
  ADD_NOTE: {
    reducer(state, {payload}) {
      const event = {
        ...payload,
        id: state.eventId,
        type: 'note'
      };
      return {
        ...state,
        events: [...state.events, event],
        eventId: state.eventId + 1
      };
    }
  },
  REMOVE_EVENT: {
    reducer(state, {payload: eventId}) {
      const {events} = state;
      return {
        ...state,
        events: events.filter(event => event.id !== eventId)
      };
    }
  },
  MOVE_NOTE: {
    reducer(state, {payload: {id: eventId, notenum, start, duration}}) {
      const events = state.events.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            notenum: notenum === undefined ? event.notenum : notenum,
            start: start === undefined ? event.start : start,
            duration: duration === undefined ? event.duration : duration
          };
        } else {
          return event;
        }
      });
      return {
        ...state,
        events
      };
    }
  },
}, initialState);
