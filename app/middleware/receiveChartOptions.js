/**
 * RECEIVE_CHART_OPTIONS middleware
 */
import update from 'immutability-helper';
import {
  RECEIVE_CHART_OPTIONS,
  RECEIVE_DEFAULTS_APPLIED_TO,
} from '../constants';
import actionTrigger from '../actions';
import defaultPalette from '../constants/defaultPalette';
import { defaultBreakpointsOpt } from '../constants/chartTypes';
import applyChartTypeDefaults from './utils/applyChartTypeDefaults';
import applyYDomain from './utils/applyYDomain';
import applyTickFormatters from './utils/applyTickFormatters';

export default function receiveChartType({ getState }) {
  return (dispatch) => (action) => {
    if (RECEIVE_CHART_OPTIONS !== action.type) {
      return dispatch(action);
    }

    /**
     * Setup local vars and functions
     */
    // Clone received options
    let nextOpts = update({}, { $set: action.data });

    /**
     * Was this dispatch triggered by bootstrap.new or bootstrap.edit?
     */
    function actionIsBootstrap() {
      return 0 === action.src.indexOf('bootstrap');
    }

    /**
     * Apply default palette if we haven't already received colors and we're not receiving them now
     * @todo Handle non-NVD3 types
     */
    function shouldApplyDefaultPalette() {
      return !actionIsBootstrap() &&
        (!nextOpts.color || !nextOpts.color.length) &&
        (!getState().chartOptions.color || !getState().chartOptions.color.length); // eslint-disable-line max-len
    }

    /**
     * Return true if we are not bootstrapping from postMessage and
     * default options not already applied for this chart type
     */
    function shouldApplyChartTypeDefaults() {
      const configType = getState().chartType.config ?
        getState().chartType.config.type : null;

      return !actionIsBootstrap() &&
        configType && configType !== getState().defaultsAppliedTo;
    }

    /**
     * Update data formatting function after manual change
     */
    function shouldApplyTickFormatters() {
      return getState().chartType.config && // must have chart type config in store
        nextOpts.tickFormatSettings && // must have settings to use
        !actionIsBootstrap(); // bootstrapStore handles this for initial load
    }

    /**
     * set yDomain if needed
     */
    function shouldApplyYDomain() {
      return !nextOpts.yDomain && // current action is not setting yDomain
        0 < getState().chartData.length && // we have data to analyze
        getState().chartType.config; // we have a chart type to apply domain to
    }

    function shouldSetBreakpoints() {
      return !nextOpts.breakpoints && !getState().chartOptions.breakpoints;
    }

    /**
     * Return the object we should merge into the default breakpoints object,
     * setting default height to stored height if needed
     */
    function setupBreakpointsOpt() {
      const defaultHeight = nextOpts.height || getState().chartOptions.height;
      if (undefined === defaultHeight) {
        return defaultBreakpointsOpt;
      }
      return update(defaultBreakpointsOpt,
        { values: { 0: { height: { $set: defaultHeight } } } });
    }

    /**
     * Handle received chart options
     */

    // Set up colors if needed. This will apply when a new chart does not receive a custom color palette
    if (shouldApplyDefaultPalette()) {
      nextOpts = update(nextOpts, { color: { $set: defaultPalette } });
    }

    // Apply default options
    if (shouldApplyChartTypeDefaults()) {
      nextOpts = applyChartTypeDefaults(
        getState().chartType.config,
        nextOpts,
        getState().defaultsAppliedTo
      );
      dispatch(actionTrigger(
        RECEIVE_DEFAULTS_APPLIED_TO,
        getState().chartType.config.type,
        action.src
      ));
    }

    if (shouldApplyTickFormatters()) {
      // applyTickFormatters returns a cloned object
      nextOpts = applyTickFormatters(nextOpts, getState().chartType.config);
    }

    if (shouldApplyYDomain()) {
      nextOpts = applyYDomain(
        nextOpts,
        getState().chartType.config,
        getState().chartData
      );
    }

    /**
     * Set default breakpoints object
     */
    if (shouldSetBreakpoints()) {
      nextOpts = update(nextOpts, { breakpoints: {
        $set: setupBreakpointsOpt(),
      } });
    }

    // Send nextOpts to Redux store
    return dispatch(actionTrigger(action.type, nextOpts, action.src));
  };
}
