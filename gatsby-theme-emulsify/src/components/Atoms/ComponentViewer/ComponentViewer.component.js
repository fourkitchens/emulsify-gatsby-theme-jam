/**
 * @file ComponentViewer.component.js
 * Exports a ComponentViewer component.
 */

import React from "react";
import PropTypes from "prop-types";
import "./ComponentViewer.css";

/**
 * Component that renders an iframe using the provided url.
 */
const ComponentViewer = props => {
  const { url } = props;

  return (
    <iframe
      src={url}
      frameBorder="0"
      className="ComponentViewer"
      scrolling="no"
      title="Component Viewer"
    ></iframe>
  );
};

ComponentViewer.propTypes = {
  url: PropTypes.string
};

ComponentViewer.defaultProps = {
  url: null
};

export default ComponentViewer;
