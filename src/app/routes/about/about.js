import React, {PropTypes, Component} from 'react';

export class About extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

About.defaultProps = {
  text: 'About route'
};

About.propTypes = {
  text: PropTypes.string
};
