import React, {PropTypes, Component} from 'react';

export default class Accordion extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Accordion.defaultProps = {
  text: 'My brand new component!'
};

Accordion.propTypes = {
  text: PropTypes.string
};
