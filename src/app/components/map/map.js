import React, {PropTypes, Component} from 'react';

export default class Map extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Map.defaultProps = {
  text: 'My brand new component!'
};

Map.propTypes = {
  text: PropTypes.string
};
