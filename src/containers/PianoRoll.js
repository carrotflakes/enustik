import { connect } from 'react-redux';
import { addNote, removeEvents, moveEvents, addEvents } from '../modules/events';

import PianoRoll from '../components/PianoRoll';

export default connect(
  state => ({
    events: state.events.events
  }),
  {
    addNote,
    removeEvents,
    moveEvents,
    addEvents,
  })(PianoRoll);
