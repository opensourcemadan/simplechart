/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { combineReducers } from 'redux';
import baseReducer from './baseReducer';
import chartOptionsReducer from './chartOptionsReducer';
import errorReducer from './errorReducer';
import * as actions from '../constants';

export default combineReducers({
  chartData: (state, action) =>
    baseReducer(state, action, [], [actions.RECEIVE_CHART_DATA]),
  chartMetadata: (state, action) =>
    baseReducer(state, action, {}, [actions.RECEIVE_CHART_METADATA]),
  chartOptions: chartOptionsReducer,
  chartType: (state, action) =>
    baseReducer(state, action, {}, [actions.RECEIVE_CHART_TYPE]),
  currentStep: (state, action) =>
    baseReducer(state, action, 0, [actions.UPDATE_CURRENT_STEP]),
  defaultsAppliedTo: (state, action) =>
    baseReducer(state, action, '', [actions.RECEIVE_DEFAULTS_APPLIED_TO]),
  dataFields: (state, action) =>
    baseReducer(state, action, [], [actions.PARSE_DATA_FIELDS]),
  dataStatus: (state, action) =>
    baseReducer(state, action, {}, [actions.PARSE_DATA_STATUS]),
  errorCode: errorReducer,
  parsedData: (state, action) =>
    baseReducer(state, action, [], [actions.PARSE_RAW_DATA]),
  rawData: (state, action) =>
    baseReducer(state, action, '', [actions.RECEIVE_RAW_DATA]),
  transformedData: (state, action) =>
    baseReducer(state, action, {}, [actions.TRANSFORM_DATA]),
  unsavedChanges: (state, action) =>
    baseReducer(state, action, false, [actions.UNSAVED_CHANGES]),
});
