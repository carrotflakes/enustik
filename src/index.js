import React from  'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import * as reducers from './reducers';
import saga from './sagas';
import configureStore from './store';
import App from './containers/App';

const store = configureStore(reducers, saga);

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root'));
