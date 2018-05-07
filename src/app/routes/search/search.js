import React, {PropTypes, Component} from 'react';

export class Search extends Component {
  render() {
    return (
      <div>
        <h2>{this.props.text}</h2>
      </div>
    );
  }
}

Search.defaultProps = {
  text: 'Search route'
};

Search.propTypes = {
  text: PropTypes.string
};
