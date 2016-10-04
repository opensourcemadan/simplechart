import React, { Component } from 'react';
import { Message } from 'rebass';
import update from 'react-addons-update';
import styles from './ErrorMessage.css';
import getErrorMessage from '../../../constants/errorCode';

export default class ErrorMessage extends Component {
  render() {
    if (!this.props.code) {
      return null;
    }

    const props = update({
      inverted: true,
      rounded: true,
      theme: 'error',
      className: styles.ErrorMessage,
    }, { $merge: this.props.override || {} });

    return React.createElement(Message, props,
      getErrorMessage(this.props.code));
  }
}

ErrorMessage.propTypes = {
  override: React.PropTypes.object,
  code: React.PropTypes.string,
};
