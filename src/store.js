import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import logger from 'redux-logger';

export default function configureStore(reducers, saga) {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    combineReducers(reducers),
    composeEnhancers(applyMiddleware(logger, sagaMiddleware)));

  sagaMiddleware.run(saga);

  return store;
}
