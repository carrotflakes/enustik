import { connect } from 'react-redux';
import { play, stop } from '../modules/player';

import App from '../components/App';

export default connect(
  state => ({
  }), {
    play,
    stop
  })(App);
