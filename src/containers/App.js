import { connect } from 'react-redux';
import { addNote } from '../moducks/events';

import App from '../components/App';

export default connect(
  state => ({
    events: state.events.events
  }),
  dispatch =>({
    addNote(value) {
      dispatch(addNote(value));
    }
  }))(App);
