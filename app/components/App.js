import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DataInput from './DataInput';
import ChartEditor from './ChartEditor';
import Header from './Header';
import Help from './Help';
import * as rebassHover from '../styles/RebassHover.css'; // eslint-disable-line no-unused-vars
import { appCover } from '../styles/App.css';

class App extends Component {
  /**
   * Overlay should capture all clicks to prevent interaction
   * with the editor while the CMS parent page is saving
   */
  static captureClicks(cmsStatus) {
    if ('cms.isSaving' === cmsStatus) {
      const cover = document.getElementById('appCover');
      if (cover) {
        cover.addEventListener('click', (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
        });
      }
    }
  }

  constructor() {
    super();
    this.renderAppComponent = this.renderAppComponent.bind(this);
    this.firstParsedCol = this.firstParsedCol.bind(this);
  }

  componentDidMount() {
    this.captureClicks(this.props.state.cmsStatus);
  }

  componentDidUpdate() {
    this.captureClicks(this.props.state.cmsStatus);
  }

  firstParsedCol() {
    const firstColKey = this.props.state.dataFields[0];
    return this.props.state.parsedData.map((row) => row[firstColKey]);
  }

  renderAppComponent() {
    if (0 === this.props.state.currentStep) {
      return React.createElement(DataInput, {
        metadata: this.props.state.chartMetadata,
        rawData: this.props.state.rawData,
        dataStatus: this.props.state.dataStatus,
        dateFormat: this.props.state.dateFormat,
        firstCol: this.firstParsedCol(),
      });
    }
    return React.createElement(ChartEditor, {
      appState: this.props.state,
    });
  }

  render() {
    return (
      // set height 100% so child divs inherit it
      <div style={{ height: '100%' }}>
        <Header
          currentStep={this.props.state.currentStep}
          unsavedChanges={this.props.state.unsavedChanges}
          errorCode={this.props.state.errorCode}
          cmsStatus={this.props.state.cmsStatus}
        />
        {this.renderAppComponent()}
        <Help docName={this.props.state.helpDocument} />
        { 'cms.isSaving' !== this.props.state.cmsStatus ? null :
          (<div id="appCover" className={appCover} />)
        }
      </div>
    );
  }
}

App.propTypes = {
  state: PropTypes.object.isRequired,
};

// Which props to inject from the global atomic state
export default connect((state) =>
  ({ state })
)(App);
