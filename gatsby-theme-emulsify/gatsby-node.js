const _ = require("lodash");
const { createFilePath } = require(`gatsby-source-filesystem`);
const util = require("util");
const Twig = require("twig");
const yaml = require("js-yaml");
const fs = require("fs");

Twig.extendFunction("bem", function(base_class, modifiers = [], blockname = '', extra = []) {
  let classes = [];

  // If using a blockname to override default class.
  if (blockname.length) {
    // Set blockname class.
    classes.push(blockname + '__' + base_class);

    // Set blockname--modifier classes for each modifier.
    if (modifiers.length && Array.isArray(modifiers)) {
      modifiers.forEach(function(modifier) {
        classes.push(blockname + '__' + base_class + '--' + modifier);
      });
    }
  }
  // If not overriding base class.
  else {
    // Set base class.
    classes.push(base_class);
    // Set base--modifier class for each modifier.
    if (modifiers.length && Array.isArray(modifiers)) {
      modifiers.forEach(function(modifier) {
        classes.push(base_class + '--' + modifier);
      });
    }
  }

  // If extra non-BEM classes are added.
  if (extra.length && Array.isArray(extra)) {
    extra.forEach(function(extra_class) {
      classes.push($extra_class);
    });
  }

  attributes = 'class="' + classes.join(' ') + '"';
  return attributes;
});

Twig.extendFunction("add_attributes", function(additional_attributes = []) {
  attributes = [];

  for (const [key, value] of Object.entries(additional_attributes)) {
    // If not keys array.
    if (key !== '_keys') {
      // If multiples items in value as array (e.g., class: ['one', 'two']).
      if (Array.isArray(value)) {
        attributes.push(key + '="' + value.join(' ') + '"');
      }
      else {
        // Handle bem() output (pass in exactly the result).
        if (value.includes('=')) {
          attributes.push(value);
        }
        else {
          attributes.push(key + '="' + value + '"');
        }
      }
    }
  }

  return attributes.join(' ');
});

const readFile = util.promisify(fs.readFile);
const renderTwig = util.promisify(Twig.renderFile);

const IN_PRODUCTION = process.env.NODE_ENV === "production";

Twig.cache(IN_PRODUCTION);

function relativeDirEq(value) {
  return file => file.relativeDirectory === value;
}

/**
 * Uses the presence of published md files as a way to decide what assets should show in the styleuide and groups them together.
 */
function createAssetMap(mdFiles, twigFiles, dataFiles, cssFiles, jsFiles) {
  const dirs = {};
  return mdFiles.reduce((acc, current) => {
    const mdParentDir = current.fields.parentDir;
    if (!dirs[mdParentDir]) {
      dirs[mdParentDir] = true;
      return [
        ...acc,
        {
          mdFile: current,
          // Organize assets that are in the same directory as the published md file
          cssFile: cssFiles.find(relativeDirEq(mdParentDir)),
          jsFile: jsFiles.find(relativeDirEq(mdParentDir)),
          twigFile: twigFiles.find(relativeDirEq(mdParentDir)),
          dataFile: dataFiles.find(relativeDirEq(mdParentDir))
        }
      ];
    }

    return acc;
  }, []);
}

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  const ComponentPost = require.resolve(`./src/components/Templates/layout.js`);
  const IsolatedTwigComponent = require.resolve(
    `./src/components/Templates/IsolatedTwigComponent.js`
  );

  return graphql(`
    {
      allMdx(
        limit: 1000
        filter: { frontmatter: { publishToStyleGuide: { eq: true } } }
      ) {
        nodes {
          fields {
            parentDir
            slug
          }
          frontmatter {
            title
            description
            publishToStyleGuide
          }
        }
      }
      twigFiles: allFile(filter: { extension: { eq: "twig" } }) {
        nodes {
          extension
          relativePath
          relativeDirectory
          absolutePath
          # DO NOT REMOVE: ctime is needed to bust gatsby cache for live reloading.
          ctime
          name
          base
        }
      }
      jsFiles: allFile(filter: { extension: { eq: "js" } }) {
        nodes {
          extension
          relativePath
          relativeDirectory
          # DO NOT REMOVE: ctime is needed to bust gatsby cache for live reloading.
          ctime
          absolutePath
          name
          base
        }
      }
      cssFiles: allFile(filter: { extension: { eq: "css" } }) {
        nodes {
          extension
          relativePath
          relativeDirectory
          # DO NOT REMOVE: ctime is needed to bust gatsby cache for live reloading.
          ctime
          absolutePath
          name
          base
        }
      }
      dataFiles: allFile(filter: { extension: { eq: "yml" } }) {
        nodes {
          extension
          relativePath
          relativeDirectory
          # DO NOT REMOVE: ctime is needed to bust gatsby cache for live reloading.
          ctime
          absolutePath
          name
          base
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      throw result.errors;
    }

    // Create component pages.
    const mdFiles = result.data.allMdx.nodes;
    const twigComponents = result.data.twigFiles.nodes;
    const cssFiles = result.data.cssFiles.nodes;
    const dataFiles = result.data.dataFiles.nodes;
    const jsFiles = result.data.jsFiles.nodes;

    const assetMap = createAssetMap(
      mdFiles,
      twigComponents,
      dataFiles,
      cssFiles,
      jsFiles
    );

    mdFiles.forEach(mdFile => {
      const asset = assetMap.find(
        asset => mdFile.fields.parentDir === asset.mdFile.fields.parentDir
      );
      const name = asset.twigFile
        ? asset.twigFile.name.replace(/\s+/g, "-").toLowerCase()
        : null;
      const iframePath = `${name}-isolated`;
      const fileRead = asset.twigFile
        ? readFile(asset.twigFile.absolutePath)
        : Promise.resolve("No Code found");
      return fileRead.then(twigCode => {
        createPage({
          path: mdFile.fields.slug,
          component: ComponentPost,
          context: {
            iframePath,
            twigCode: String(twigCode),
            slug: mdFile.fields.slug,
            collection: mdFile.fields.collection,
            parentDir: mdFile.fields.parentDir
          }
        });
      });
    });

    return Promise.all(
      assetMap.map(assets => {
        const { twigFile, dataFile, jsFile, cssFile } = assets;

        if (twigFile) {
          return readFile(dataFile.absolutePath, "utf8").then(yml => {
            const data = yaml.safeLoad(yml);
            const name = twigFile.name.replace(/\s+/g, "-").toLowerCase();
            return createPage({
              path: `${name}-isolated`,
              component: IsolatedTwigComponent,
              context: {
                data,
                ...twigFile,
                jsFile,
                cssFile,
                assetMap
              }
            });
          });
        }
        return Promise.resolve();
      })
    );
  });
};

exports.onCreateNode = async ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `Mdx`) {
    let value = createFilePath({
      node,
      getNode
    }).toLowerCase();
    value = value.replace(/\s+/g, "-").toLowerCase();
    createNodeField({
      name: `slug`,
      node,
      value
    });

    // Get the parent node
    const parent = getNode(_.get(node, "parent"));
    createNodeField({
      node,
      name: "collection",
      value: _.get(parent, "sourceInstanceName")
    });
    createNodeField({
      node,
      name: "parentDir",
      value: _.get(parent, "relativeDirectory")
    });
  }

  if (
    node.internal.type === "SitePage" &&
    node.context &&
    node.context.extension === "twig"
  ) {
    const fileReads = [];

    if (node.context.absolutePath) {
      fileReads.push(renderTwig(node.context.absolutePath, node.context.data));
    }

    const jsFileReads = [];
    node.context.assetMap.forEach(asset => {
      if (asset.jsFile) {
        jsFileReads.push(readFile(asset.jsFile.absolutePath, "utf8"));
      }
    });

    const jsFiles = await Promise.all(jsFileReads);

    if (jsFiles.length) {
      fileReads.push(jsFiles.join("\n"));
    } else {
      fileReads.push("");
    }

    const cssFileReads = [];
    node.context.assetMap.forEach(asset => {
      if (asset.cssFile) {
        cssFileReads.push(readFile(asset.cssFile.absolutePath, "utf8"));
      }
    });

    const cssFiles = await Promise.all(cssFileReads);

    // lol
    if (cssFiles.length) {
      fileReads.push(cssFiles.join("\n"));
    } else {
      fileReads.push("");
    }
    return Promise.all(fileReads).then(([componentHtml, js, css]) => {
      createNodeField({
        node,
        name: "componentHtml",
        value: componentHtml
      });
      createNodeField({
        node,
        name: "jsCode",
        value: js
      });
      createNodeField({
        node,
        name: "cssCode",
        value: css
      });
    });
  }
};
