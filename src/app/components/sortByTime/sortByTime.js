import React, {PropTypes, Component} from 'react';

export default class SortByTime extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

SortByTime.defaultProps = {
  text: 'My brand new component!'
};

SortByTime.propTypes = {
  text: PropTypes.string
};
