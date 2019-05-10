import React from  'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import * as reducers from './reducers';
import * as sagas from './sagas';
import configureStore from './store';
import App from './containers/App';
console.log(reducers)
const store = configureStore(reducers, sagas);

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root'));
