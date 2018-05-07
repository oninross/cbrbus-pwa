import React, {PropTypes, Component} from 'react';

export class Bookmarks extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Bookmarks.defaultProps = {
  text: 'Bookmarks route'
};

Bookmarks.propTypes = {
  text: PropTypes.string
};
