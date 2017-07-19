import cloneDeep from 'lodash/fp/cloneDeep';
import compose from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import merge from 'lodash/fp/merge';
import set from 'lodash/fp/set';
import {
  RECEIVE_CHART_OPTIONS,
  RECEIVE_CHART_TYPE,
  RECEIVE_DATE_FORMAT,
  RECEIVE_TICK_FORMAT,
} from '../constants';
import applyChartTypeDefaults from './utils/applyChartTypeDefaults';
// import { applyScopedTickFormatters } from './utils/applyTickFormatters';
import applyYDomain from './utils/applyYDomain';
import { defaultBreakpointsOpt } from '../constants/chartTypes';
import defaultPalette from '../constants/defaultPalette';
import { transformParsedData } from '../utils/rawDataHelpers';
import { actionSourceContains } from '../utils/misc';
import {
  defaultTickFormatSettings,
  formatScopes,
} from '../constants/defaultTickFormatSettings';

export default function chartOptionsReducer(state, action) {
  switch (action.type) {
    case RECEIVE_CHART_OPTIONS:
      return reduceReceiveChartOptions(state, action);

    case RECEIVE_CHART_TYPE: {
      const newState = reduceReceiveChartType(state, action);
      // Reduce chart options, so default options are applied.
      return reduceReceiveChartOptions(newState, { data: {}, src: action.src });
    }

    case RECEIVE_DATE_FORMAT:
      return reduceReceiveDateFormat(state, action);

    case RECEIVE_TICK_FORMAT: {
      return reduceReceiveTickFormat(state, action);
      // return applyScopedTickFormatters(newState);
    }

    default:
  }

  return state;
}

export function reduceReceiveChartOptions(state, { data, src }) {
  const { chartData, chartType: { config } } = state;
  let newOptions = cloneDeep(data);
  const currentOptions = state.chartOptions;

  if (!actionSourceContains(src, 'bootstrap')) {
    const shouldApplyDefaultPallette = !get('color.length', currentOptions);
    if (shouldApplyDefaultPallette) {
      newOptions = merge(newOptions, { color: defaultPalette });
    }

    // const shouldApplyTickFormatters = newOptions.tickFormatSettings && config;
    // if (shouldApplyTickFormatters) {
    //   newOptions = applyTickFormatters(newOptions, config);
    // }
  }

  const shouldApplyYDomain = chartData.length && config && !newOptions.yDomain;
  if (shouldApplyYDomain) {
    newOptions = applyYDomain(newOptions, config, chartData);
  }

  const shouldApplyBreakpoints = !newOptions.breakpoints;
  if (shouldApplyBreakpoints) {
    const breakpoints = merge(defaultBreakpointsOpt, {
      values: [{ height: newOptions.height || currentOptions.height }],
    });
    newOptions = merge(newOptions, { breakpoints });
  }

  return merge(state, {
    chartOptions: newOptions,
    errorCode: '',
  });
}

export function reduceReceiveChartType(state, { data, src }) {
  const { chartType, dataFields } = state;
  const typeChanged = get('config.type', chartType) !== data.config.type;

  if (actionSourceContains(src, 'bootstrap') || !typeChanged) {
    return merge(state, { chartType: cloneDeep(data) });
  }

  let newOptions = applyChartTypeDefaults(data.config, {});

  if ('function' === typeof data.conditionalOpts) {
    newOptions = merge(newOptions, data.conditionalOpts(state));
  }

  // Clear yDomain on chart type change to have a default one generated.
  newOptions = set('yDomain', null, newOptions);

  // Prepopulate labels for scatter charts
  if ('nvd3ScatterMultiSeries' === data.config.dataFormat) {
    const [, xLabel, yLabel] = dataFields;
    newOptions = merge(newOptions, {
      xAxis: {
        axisLabel: xLabel,
      },
      yAxis: {
        axisLabel: yLabel,
      },
    });
  }

  return compose(
    set('chartType', cloneDeep(data)),
    set('chartOptions', newOptions)
  )(state);
}

export function reduceReceiveDateFormat(state, { data }) {
  const dateFormat = merge(state.chartOptions.dateFormat, data);

  const isValid = dateFormat.enabled && dateFormat.validated;
  if (!isValid) {
    return merge(state, { chartOptions: { dateFormat } });
  }

  return merge(state, {
    chartOptions: {
      dateFormat,
      xAxis: {
        dateFormatString: dateFormat.formatString,
      },
    },
    transformedData: transformParsedData(
      state.parsedData,
      state.dataFields,
      dateFormat
    ),
  });
}

/**
 * Merge scoped format update into scoped format settings, e.g. { xAxis: { locale: 12 } }
 */
export function reduceReceiveTickFormat(state, { data }) {
  const scope = Object.keys(data)[0];
  const receivedUpdate = data[scope];
  const oldSettings = state.chartOptions.tickFormatSettings || {};
  let newSettings;

  const getMergedSettings = (scopeName) => Object.assign(
    {},
    defaultTickFormatSettings,
    (oldSettings[scopeName] || {}),
    receivedUpdate
  );

  if ('all' === scope) {
    const globalSettings = getMergedSettings('all');
    newSettings = formatScopes.reduce((acc, { name }) => {
      acc[name] = globalSettings;
      return acc;
    }, {});
  } else {
    newSettings = Object.assign(
      {},
      oldSettings,
      set(scope, getMergedSettings(scope), {})
    );
  }

  // Now we have a complete object to replace chartOptions.tickFormatSettings
  return set('chartOptions.tickFormatSettings', newSettings, state);
}
