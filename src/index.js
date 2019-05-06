import React from  'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import * as reducers from './moducks/reducers';
import * as sagas from './moducks/sagas';
import configureStore from './store';
import App from './containers/App';

const store = configureStore(reducers, sagas);
store.runSaga();

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root'));
