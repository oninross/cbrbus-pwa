import React, {PropTypes, Component} from 'react';

export default class About extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

About.defaultProps = {
  text: 'My brand new component!'
};

About.propTypes = {
  text: PropTypes.string
};
