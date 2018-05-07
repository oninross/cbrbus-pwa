import React, {PropTypes, Component} from 'react';

export default class CardHeader extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

CardHeader.defaultProps = {
  text: 'My brand new component!'
};

CardHeader.propTypes = {
  text: PropTypes.string
};
