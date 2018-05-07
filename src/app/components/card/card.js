import React, {PropTypes, Component} from 'react';

export default class Card extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Card.defaultProps = {
  text: 'My brand new component!'
};

Card.propTypes = {
  text: PropTypes.string
};
