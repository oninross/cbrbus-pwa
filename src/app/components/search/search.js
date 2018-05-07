import React, {PropTypes, Component} from 'react';

export default class Search extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Search.defaultProps = {
  text: 'My brand new component!'
};

Search.propTypes = {
  text: PropTypes.string
};
