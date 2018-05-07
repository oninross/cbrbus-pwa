import React, {PropTypes, Component} from 'react';

export default class Button extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Button.defaultProps = {
  text: 'My brand new component!'
};

Button.propTypes = {
  text: PropTypes.string
};
