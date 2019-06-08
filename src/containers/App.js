import { connect } from 'react-redux';
import { play, stop } from '../modules/player';
import { undo, redo } from '../modules/history';

import App from '../components/App';

export default connect(
  state => ({
  }), {
    play,
    stop,
    undo,
    redo,
  })(App);
