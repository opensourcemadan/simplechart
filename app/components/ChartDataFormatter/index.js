import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import update from 'immutability-helper';
import NextPrevButton from '../Layout/RebassComponents/NextPrevButton';
import { locales } from '../../constants/d3Locales';
import { RECEIVE_CHART_OPTIONS } from '../../constants';
import DispatchField from '../lib/DispatchField';
import {
  defaultTickFormatSettings,
  multiplierOptions,
} from '../../constants/defaultTickFormatSettings';
import FormatScopeSelect from './FormatScopeSelect';

const defaultFormatScope = 'all';

const buttonOpts = [
  { name: 'all', label: 'All' },
  { name: 'xAxis', label: 'X Axis' },
  { name: 'yAxis', label: 'Y Axis' },
  { name: 'tooltip', label: 'Tooptip' },
];

class ChartDataFormatter extends Component {
  static propTypes = {
    options: PropTypes.object.isRequired,
  };

  static handleProps(settings) {
    return update(defaultTickFormatSettings, { $merge: settings });
  }

  static localeOptions() {
    return locales.map((locale, idx) => ({
      children: `${locale.emoji} ${locale.name}`,
      value: idx,
    }));
  }

  componentWillMount() {
    const initState = ChartDataFormatter.handleProps(
      this.props.options.tickFormatSettings || {}
    );
    initState.formatScope = defaultFormatScope;
    this.setState(initState);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      ChartDataFormatter.handleProps(nextProps.options.tickFormatSettings || {})
    );
  }

  setFormatScope = (formatScope) => {
    this.setState({ formatScope });
  }

  /**
   * Return full tickFormatSettings object after any element is changed
   */
  handleChange = (fieldProps, value) => {
    const field = fieldProps.name.split('.').pop();
    return {
      tickFormatSettings: update(this.state, { [field]: { $set: value } }),
    };
  };

  render() {
    return (
      <div>
        <div>
          <FormatScopeSelect
            buttonOpts={buttonOpts}
            value={this.state.formatScope}
            handler={this.setFormatScope}
          />

          <DispatchField
            action={RECEIVE_CHART_OPTIONS}
            fieldType="Select"
            fieldProps={{
              label: 'Format currency and thousands separator as:',
              name: 'tickFormatSettings.locale',
              options: ChartDataFormatter.localeOptions(),
              value: this.state.locale,
            }}
            handler={this.handleChange}
          />

          <DispatchField
            action={RECEIVE_CHART_OPTIONS}
            fieldType="Checkbox"
            fieldProps={{
              label: 'Show currency symbol?',
              name: 'tickFormatSettings.showCurrencySymbol',
              checked: this.state.showCurrencySymbol,
            }}
            handler={this.handleChange}
          />

          <DispatchField
            action={RECEIVE_CHART_OPTIONS}
            fieldType="Checkbox"
            fieldProps={{
              label: 'Use thousands separator',
              name: 'tickFormatSettings.groupThousands',
              checked: this.state.groupThousands,
            }}
            handler={this.handleChange}
          />

          <DispatchField
            action={RECEIVE_CHART_OPTIONS}
            fieldType="Checkbox"
            fieldProps={{
              label: 'Display as percentage',
              name: 'tickFormatSettings.usePercent',
              checked: this.state.usePercent,
            }}
            handler={this.handleChange}
          />

          <DispatchField
            action={RECEIVE_CHART_OPTIONS}
            fieldType="Input"
            fieldProps={{
              label: 'Leading text',
              name: 'tickFormatSettings.prepend',
              value: this.state.prepend,
            }}
            handler={this.handleChange}
          />

          <DispatchField
            action={RECEIVE_CHART_OPTIONS}
            fieldType="Input"
            fieldProps={{
              label: 'Trailing text',
              name: 'tickFormatSettings.append',
              value: this.state.append,
            }}
            handler={this.handleChange}
          />

          <DispatchField
            action={RECEIVE_CHART_OPTIONS}
            fieldType="Input"
            fieldProps={{
              label: 'Decimal places',
              type: 'number',
              step: 1,
              min: 0,
              name: 'tickFormatSettings.decimalPlaces',
              value: this.state.decimalPlaces,
            }}
            handler={this.handleChange}
          />

          <DispatchField
            action={RECEIVE_CHART_OPTIONS}
            fieldType="Select"
            fieldProps={{
              label: 'Multiply/divide values',
              name: 'tickFormatSettings.multiplier',
              options: multiplierOptions,
              value: this.state.multiplier,
            }}
            handler={this.handleChange}
          />

        </div>
        <NextPrevButton
          text="Next"
          currentStep={3}
          dir="next"
        />
      </div>
    );
  }
}

export default connect()(ChartDataFormatter);
