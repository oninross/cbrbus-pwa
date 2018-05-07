import React, {PropTypes, Component} from 'react';

export class Nearby extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Nearby.defaultProps = {
  text: 'Nearby route'
};

Nearby.propTypes = {
  text: PropTypes.string
};
