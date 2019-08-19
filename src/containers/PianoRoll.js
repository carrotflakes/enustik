import { connect } from 'react-redux';
import { addNote, removeEvents, moveEvents, addEvents } from '../modules/events';
import { setTick } from '../modules/player';

import PianoRoll from '../components/PianoRoll';

export default connect(
  state => ({
    events: state.events.events,
    tick: state.player.tick,
  }),
  {
    addNote,
    removeEvents,
    moveEvents,
    addEvents,
    setTick,
  })(PianoRoll);
