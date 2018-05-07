import React, {PropTypes, Component} from 'react';

export default class Header extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Header.defaultProps = {
  text: 'My brand new component!'
};

Header.propTypes = {
  text: PropTypes.string
};
