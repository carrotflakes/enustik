import { connect } from 'react-redux';
import { addNote, removeEvent, moveNote, addEvents } from '../modules/events';

import PianoRoll from '../components/PianoRoll';

export default connect(
  state => ({
    events: state.events.events
  }),
  {
    addNote,
    removeEvent,
    moveNote,
    addEvents,
  })(PianoRoll);
