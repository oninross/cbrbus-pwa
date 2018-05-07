import React, {PropTypes, Component} from 'react';

export default class Bookmarks extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Bookmarks.defaultProps = {
  text: 'My brand new component!'
};

Bookmarks.propTypes = {
  text: PropTypes.string
};
