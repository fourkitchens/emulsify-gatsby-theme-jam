import React from "react";
import { graphql } from "gatsby";

/**
 * This page template is used for rendering a twig component in isolation.
 * An iframe is used to ensure the component and the style guide don't leak styles
 */
export default class IsolatedTwigComponent extends React.Component {
  assetReference = "asset";

  addJs = () => {
    const {
      data: {
        sitePage: {
          fields: { jsCode }
        }
      }
    } = this.props;
    const id = `${this.assetReference}Js`;
    const assetCode = document.querySelector(`#${id}`);
    if (assetCode) {
      assetCode.remove();
    }
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.id = id;
    s.innerHTML = jsCode;
    document.body.appendChild(s);
  };

  addCss = () => {
    const {
      data: {
        sitePage: {
          fields: { cssCode }
        }
      }
    } = this.props;
    const id = `${this.assetReference}Css`;
    const assetCode = document.querySelector(`#${id}`);
    if (assetCode) {
      assetCode.remove();
    }
    const s = document.createElement("style");
    s.type = "text/css";
    s.id = id;
    s.innerHTML = cssCode;
    document.body.appendChild(s);
  };

  componentDidMount() {
    const {
      data: {
        sitePage: {
          fields: { jsCode, cssCode }
        }
      }
    } = this.props;
    if (jsCode) {
      this.addJs();
    }
    if (cssCode) {
      this.addCss();
    }
  }
  componentDidUpdate() {
    const {
      data: {
        sitePage: {
          fields: { jsCode, cssCode }
        }
      }
    } = this.props;
    if (jsCode) {
      this.addJs();
    }
    if (cssCode) {
      this.addCss();
    }
  }

  render() {
    const {
      data: {
        sitePage: {
          fields: { componentHtml }
        }
      }
    } = this.props;
    return <div dangerouslySetInnerHTML={{ __html: componentHtml }} />;
  }
}

export const pageQuery = graphql`
  query IsolatedTwigComponentQuery($relativePath: String) {
    sitePage(context: { relativePath: { eq: $relativePath } }) {
      fields {
        componentHtml
        jsCode
        cssCode
      }
    }
  }
`;
