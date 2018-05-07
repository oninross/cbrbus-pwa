import React, {PropTypes, Component} from 'react';

export default class Loader extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Loader.defaultProps = {
  text: 'My brand new component!'
};

Loader.propTypes = {
  text: PropTypes.string
};
