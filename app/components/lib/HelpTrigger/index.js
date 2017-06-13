import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import actionTrigger from '../../../actions';
import { RECEIVE_HELP_DOCUMENT } from '../../../constants';
import infoSvg from '!!raw-loader!../../../img/icons/info-circle.svg'; // eslint-disable-line
import * as styles from './HelpTrigger.css';

/**
 * Render SVG icon that opens the Help panel when clicked
 * by sending the name of a Markdown doc to Redux
 */
class HelpTrigger extends Component {
  constructor() {
    super();
    this.dispatch = this.dispatch.bind(this);
  }

  dispatch() {
    // Toggling the panel is handled in middleware
    this.props.dispatch(
      actionTrigger(RECEIVE_HELP_DOCUMENT, this.props.docName));
  }

  render() {
    return (
      <span
        style={this.props.style || null}
        className={styles.icon}
        dangerouslySetInnerHTML={{ __html: infoSvg }}
        onClick={this.dispatch}
        role="button"
        tabIndex={0}
      />
    );
  }
}

HelpTrigger.propTypes = {
  docName: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(HelpTrigger);
