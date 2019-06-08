import { resolution } from '../consts';
import { undoable } from './history';

const ADD_NOTE = 'enustik/events/ADD_NOTE';
const REMOVE_EVENT = 'enustik/events/REMOVE_EVENT';
const MOVE_NOTE = 'enustik/events/MOVE_NOTE';

export function addNote(note) {
  return {
    type: ADD_NOTE,
    note,
    UNDOABLE: true
  };
}

export function removeEvent(eventId) {
  return {
    type: REMOVE_EVENT,
    eventId,
    UNDOABLE: true
  };
}

export function moveNote(note) {
  return {
    type: MOVE_NOTE,
    note,
    UNDOABLE: true
  };
}

const initialState = {
  events: [],
  eventId: 1,
};

export const reducer = undoable((state=initialState, action) => {
  return ({
    [ADD_NOTE]({note}) {
      const event = {
        ...note,
        id: state.eventId,
        type: 'note'
      };
      return {
        ...state,
        events: [...state.events, event],
        eventId: state.eventId + 1
      };
    },
    [REMOVE_EVENT]({eventId}) {
      const {events} = state;
      return {
        ...state,
        events: events.filter(event => event.id !== eventId)
      };
    },
    [MOVE_NOTE]({note: {id: eventId, notenum, start, duration}}) {
      const events = state.events.map(event => (
        event.id === eventId ?
        {
          ...event,
          notenum: notenum === undefined ? event.notenum : notenum,
          start: start === undefined ? event.start : start,
          duration: duration === undefined ? event.duration : duration
        } : event));
      return {
        ...state,
        events
      };
    },
  }[action.type] || (()=>state))(action);
});

export function* rootSaga() {
}
