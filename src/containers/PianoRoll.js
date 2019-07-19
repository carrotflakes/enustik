import { connect } from 'react-redux';
import { addNote, removeEvent, moveEvents, addEvents } from '../modules/events';

import PianoRoll from '../components/PianoRoll';

export default connect(
  state => ({
    events: state.events.events
  }),
  {
    addNote,
    removeEvent,
    moveEvents,
    addEvents,
  })(PianoRoll);
