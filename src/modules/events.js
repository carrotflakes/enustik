import { resolution } from '../consts';
import { undoable } from './history';

const ADD_NOTE = 'enustik/events/ADD_NOTE';
const REMOVE_EVENT = 'enustik/events/REMOVE_EVENT';
const MOVE_EVENTS = 'enustik/events/MOVE_EVENTS';
const ADD_EVENTS = 'enustik/events/ADD_EVENTS';
const RESTORE = 'enustik/events/RESTORE';

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

export function moveEvents(events) {
  return {
    type: MOVE_EVENTS,
    events,
    UNDOABLE: true
  };
}

export function addEvents(events) {
  return {
    type: ADD_EVENTS,
    events,
    UNDOABLE: true
  };
}

export function restore(events) {
  return {
    type: RESTORE,
    events,
    UNDOABLE: true // ?
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
    [MOVE_EVENTS]({events}) {
      return {
        ...state,
        events: state.events.map(event => {
          const e = events.find(e => event.id === e.id);
          if (e)
            return {
              ...event,
              notenum: e.notenum === undefined ? event.notenum : e.notenum,
              start: e.start === undefined ? event.start : e.start,
              duration: e.duration === undefined ? event.duration : e.duration
            };
          return event;
        })
      };
    },
    [ADD_EVENTS]({events}) {
      const appendEvents = events.map((event, i) => ({
        ...event,
        id: state.eventId + i
      }));
      return {
        ...state,
        events: [...state.events, ...appendEvents],
        eventId: state.eventId + appendEvents.length
      };
    },
    [RESTORE]({events}) {
      let eventId = 0;
      for (const e of events)
        if (eventId < e.id)
          eventId = e.id;
      eventId += 1;
      return {
        ...state,
        events,
        eventId
      };
    },
  }[action.type] || (()=>state))(action);
});

export function* rootSaga() {
}
