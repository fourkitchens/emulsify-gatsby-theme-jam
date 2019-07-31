import React from "react";

export default class IsolatedReactComponent extends React.Component {
  render() {
    const {
      pageContext: { absolutePathToComponent }
    } = this.props;

    return (
      <div>
        <h1>Welp, this is working</h1>
        <div>{absolutePathToComponent}</div>
      </div>
    );
  }
}
