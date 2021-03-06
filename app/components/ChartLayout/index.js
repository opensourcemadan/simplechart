import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'rebass';
import update from 'immutability-helper';
import {
  RECEIVE_ERROR,
  RECEIVE_CHART_OPTIONS,
} from '../../constants';
import actionTrigger from '../../actions';
import AccordionBlock from '../Layout/AccordionBlock';
import DispatchField from '../lib/DispatchField';
import HelpTrigger from '../lib/HelpTrigger';
import { defaultBreakpoint } from '../../constants/chartTypes';

class ChartLayout extends Component {
  static propTypes = {
    options: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  /**
   * Determine if a "no max width" breakpoint can be added
   *
   * @param {Array} breakpoints
   * @return {Boolean} False if any breakpoint has noMaxWidth -> true; otherwise true
   */
  static canAddNoMaxWidth(breakpoints) {
    return 0 === breakpoints.filter((point) => point.noMaxWidth).length;
  }

  /**
   * Determine if a breakpoint already exists with a certain max width
   *
   * @param {(int|String)} updateIdx Index in breakpoints array that we are attempting to overwrite
   * @param {int} maxWidth Max width value we are attempting to set
   * @param {Array} breakpoints List of all current breakpoints
   * @return {Boolean} True is max width already exists, false if not
   */
  static maxWidthIsSet(updateIdx, maxWidth, breakpoints) {
    return 0 !== breakpoints.filter((point, idx) =>
        (parseInt(updateIdx, 10) !== idx && // account for numeric strings
        !point.noMaxWidth && // ok to duplicate an ignored maxWidth
        maxWidth === point.maxWidth) // now check duplication
      ).length;
  }

  state = {
    active: 0,
    values: [],
  };

  componentWillMount() {
    if (this.props.options.breakpoints) {
      this.setState(this.props.options.breakpoints);
    } else {
      this.setState({ values: [defaultBreakpoint] });
    }
  }

  componentWillReceiveProps(nextProps) {
    const nextBp = nextProps.options.breakpoints;
    if (undefined === nextBp) {
      return;
    }

    // Change active bp if necessary
    if (nextBp.active !== this.state.active) {
      this.setState({ active: nextBp.active });
    }

    // Make sure that noMaxWidth is enforced if there is only 1 breakpoint
    if (1 === nextBp.values.length && !nextBp.values[0].noMaxWidth) {
      this.dispatchValues(update(nextBp.values, { 0: {
        noMaxWidth: { $set: true },
      } }));
    }
  }

  handleEmbedHeightChange = (fieldProps, newValue) => {
    this.props.dispatch(actionTrigger(
      RECEIVE_CHART_OPTIONS,
      {
        embedHeight: newValue,
      }
    ));
  }

  handleChange = (fieldProps, newValue) => {
    // break field name into index and key
    const fieldNameParts = fieldProps.name.split('.');

    // Error if trying to set multiple breakpoints to noMaxWidth
    if ('noMaxWidth' === fieldNameParts[1] &&
      newValue &&
      !ChartLayout.canAddNoMaxWidth(this.state.values)
    ) {
      this.props.dispatch(actionTrigger(RECEIVE_ERROR, 'e006'));
      return;
    }

    // Error if setting multiple breakpoints to same maxWidth
    if ('maxWidth' === fieldNameParts[1] &&
      ChartLayout.maxWidthIsSet(fieldNameParts[0], newValue, this.state.values)
    ) {
      this.props.dispatch(actionTrigger(RECEIVE_ERROR, 'e007'));
      return;
    }

    // merge new value as key into the updated index
    this.dispatchValues(update(this.state.values, {
      [fieldNameParts[0]]: { $merge: { [fieldNameParts[1]]: newValue } },
    }));
  };

  removeBreakpoint = (evt) => {
    const idx = parseInt(evt.target.getAttribute('data-index'), 10);
    if (isNaN(idx)) {
      return;
    }
    this.dispatchValues(update(this.state.values, {
      $splice: [[idx, 1]],
    }));
  };

  addBreakpoint = () => {
    this.dispatchValues(update(this.state.values, {
      $push: [
        update(defaultBreakpoint, { noMaxWidth: { $set: false } }),
      ],
    }));
  };

  dispatchValues = (values) => {
    this.setState({ values });
    this.props.dispatch(actionTrigger(
      RECEIVE_CHART_OPTIONS,
      { breakpoints: { values } }
    ));
  };

  updateActiveBreakpoint = (idx, isExpanded) => {
    if (isExpanded) {
      this.setState({ active: idx });
    }
    this.props.dispatch(actionTrigger(
      RECEIVE_CHART_OPTIONS,
      { breakpoints: { active: idx } }
    ));
  };

  isSingleBp = () => 1 >= this.state.values.length;

  renderBreakpoint = (point, idx) => {
    const pointTitle = `Breakpoint ${1 + idx}`;
    const callback = (isExpanded) => {
      this.updateActiveBreakpoint(idx, isExpanded);
    };
    return (
      <AccordionBlock
        title={pointTitle}
        tooltip={`Set max width and height for ${pointTitle}`}
        key={`breakpoint.${idx}`}
        defaultExpand={this.state.active === idx}
        updateExpandOnProps
        toggleCallback={callback}
      >
        <DispatchField
          fieldType="Checkbox"
          fieldProps={{
            label: this.isSingleBp() ? 'All widths' : 'No max width',
            name: `${idx}.noMaxWidth`,
            disabled: this.isSingleBp(),
            checked: point.noMaxWidth,
          }}
          handler={this.handleChange}
        />
        {point.noMaxWidth ? '' : (
          <DispatchField
            fieldType="Input"
            fieldProps={{
              label: 'Max width',
              name: `${idx}.maxWidth`,
              value: point.maxWidth,
              disabled: point.noMaxWidth,
              type: 'number',
              step: 1,
              min: 350,
            }}
            handler={this.handleChange}
          />
        )}
        <DispatchField
          fieldType="Input"
          fieldProps={{
            label: 'Height',
            name: `${idx}.height`,
            value: point.height,
            type: 'number',
            step: 1,
            min: 100,
          }}
          handler={this.handleChange}
        />
        {this.isSingleBp() ? '' : (
          <Button
            theme="error"
            data-index={idx}
            onClick={this.removeBreakpoint}
          >Remove</Button>
        )}
      </AccordionBlock>
    );
  };

  render() {
    return (
      <div>
        <AccordionBlock
          title="Custom Embed Height"
          tooltip="If needed, set a custom embed/iframe height for the chart"
          defaultExpand
        >
          <DispatchField
            fieldType="Input"
            fieldProps={{
              label: 'Iframe Embed Height',
              name: 'embedHeight',
              value: this.props.options.embedHeight,
              type: 'number',
              step: 1,
              min: 350,
            }}
            handler={this.handleEmbedHeightChange}
          />
        </AccordionBlock>
        {this.state.values.map(this.renderBreakpoint)}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            theme="success"
            big
            onClick={this.addBreakpoint}
          >Add Breakpoint</Button>
          <HelpTrigger style={{ marginLeft: '12px' }} docName="breakpoints" />
        </div>
      </div>
    );
  }
}

export default connect()(ChartLayout);
