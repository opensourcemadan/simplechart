import Tooltip from 'britecharts/src/charts/Tooltip';
import StackedAreaChart from 'britecharts/src/charts/stacked-area';
import * as d3Selection from 'd3-selection';

import React, { Component } from 'react';
import '!!style-loader!raw-loader!britecharts/dist/css/britecharts.css';

export default class BritechartsAdapter extends Component {
  constructor(props) {
    super(props);

    this._renderChart = this._renderChart.bind(this);
    this._setContainer = this._setContainer.bind(this);

    this.chartMap = {
      stackedAreaChart: StackedAreaChart,
    };
  }

  componentDidMount() {
    this._renderChart();
  }

  shouldComponentUpdate(nextProps) {
    return !!this.chartMap[nextProps.options.type];
  }

  componentDidUpdate() {
    this._renderChart();
  }

  _renderChart() {
    const { data, options } = this.props;
    const { width, height, color, type, xAxis, yAxis } = options;

    const container = d3Selection.select(this.container);
    const chartWidth = width || container.node().getBoundingClientRect().width;
    const xAxisLabel = xAxis ? xAxis.axisLabel : null;
    const chart = new this.chartMap[type]();
    const chartTooltip = new Tooltip();

    // TODO: Map dateFormat.formatString, if available, to d3TimeString, and apply it to XFormat.
    // TODO: Figure out correct color pallete mapping
    // TODO: Figure out data format
    // TODO: Legend
    chart
      .grid('horizontal')
      .width(chartWidth)
      .height(height)
      .colorSchema(color)
      // .forceAxisFormat('custom')
      // .forcedXFormat('%Y')
      .on('customMouseOver', chartTooltip.show)
      .on('customMouseMove', chartTooltip.update)
      .on('customMouseOut', chartTooltip.hide);

    // Labels only available for Stepchart
    // https://github.com/eventbrite/britecharts/issues/120
    if (xAxisLabel) {
      chart.xAxisLabel(xAxisLabel);
    }

    if (yAxis) {
      chart.yAxisLabel(yAxis.axisLabel);
    }

    chartTooltip
      .topicLabel('values')
      .title(xAxisLabel || 'Values');

    container.datum(data).call(chart);

    container
      .select('.metadata-group .vertical-marker-container')
      .datum([]).call(chartTooltip);
  }

  _setContainer(container) {
    this.container = container;
  }

  render() {
    // Key prop is for forcing re-render of the chart when props change.
    return (
      <div
        key={Math.random()}
        ref={this._setContainer}
        className="britechart-chart-container"
      />
    );
  }
}

BritechartsAdapter.propTypes = {
  data: React.PropTypes.array,
  options: React.PropTypes.object,
  widget: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.bool,
  ]),
};
