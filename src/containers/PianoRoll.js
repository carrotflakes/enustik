import { connect } from 'react-redux';
import * as events from '../modules/events';

import PianoRoll from '../components/PianoRoll';

export default connect(
  state => ({
    events: state.events.events
  }),
  dispatch =>({
    addNote(value) {
      dispatch(events.addNote(value));
    },
    removeEvent(value) {
      dispatch(events.removeEvent(value));
    },
    moveNote(value) {
      dispatch(events.moveNote(value));
    },
  }))(PianoRoll);
