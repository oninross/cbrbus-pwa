import React, {PropTypes, Component} from 'react';

export default class Nearby extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Nearby.defaultProps = {
  text: 'My brand new component!'
};

Nearby.propTypes = {
  text: PropTypes.string
};
