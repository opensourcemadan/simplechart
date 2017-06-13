// Import third party libraries
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { AppContainer } from 'react-hot-loader';

import '!!style-loader!raw-loader!nvd3/build/nv.d3.css'; // eslint-disable-line import/no-webpack-loader-syntax

// Middleware
import thunk from 'redux-thunk';
import receiveRawData from './middleware/receiveRawData';
import receiveDateFormat from './middleware/receiveDateFormat';
import receiveChartType from './middleware/receiveChartType';
import receiveChartOptions from './middleware/receiveChartOptions';
import receiveHelpDocument from './middleware/receiveHelpDocument';
import actionLogging from './middleware/actionLogging';

// Other stuff
import { bootstrapAppData } from './actions';
import App from './components/App';
import { sendMessage } from './utils/postMessage';
import rootReducer, { initialState } from './reducers/rootReducer';
import getPublicPath from './utils/getPublicPath';

// Set public path for loading chunks and other assets
__webpack_public_path__ = __webpack_public_path__ || getPublicPath(); // eslint-disable-line camelcase,no-undef

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line no-underscore-dangle

const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(
    applyMiddleware(
      thunk,
      receiveRawData,
      receiveDateFormat,
      receiveChartType,
      receiveChartOptions,
      receiveHelpDocument,
      actionLogging
    )
  )
);

store.dispatch(bootstrapAppData());

const appEl = document.getElementById('app');
ReactDOM.render(
  <AppContainer>
    <Provider store={store}>
      <App />
    </Provider>
  </AppContainer>,
  appEl
);

if (module.hot) {
  // Make reducers hot reloadable
  module.hot.accept('./reducers/rootReducer', () => {
    const nextRootReducer = require('./reducers/rootReducer').default; // eslint-disable-line global-require
    store.replaceReducer(nextRootReducer);
  });

  // Make components hot reloadable
  module.hot.accept('./components/App', () => {
    const NextApp = require('./components/App').default; // eslint-disable-line global-require
    ReactDOM.render(
      <AppContainer>
        <Provider store={store}>
          <NextApp />
        </Provider>
      </AppContainer>,
      appEl
    );
  });
}

sendMessage('appReady');
