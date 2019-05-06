import { connect } from 'react-redux';
import { addNote } from '../moducks/events';

import PianoRoll from '../components/PianoRoll';

export default connect(
  state => ({
    events: state.events.events
  }),
  dispatch =>({
    addNote(value) {
      dispatch(addNote(value));
    }
  }))(PianoRoll);
