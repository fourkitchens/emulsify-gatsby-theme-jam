# Setting up your design system
* Create a `package.json`
  * Give it a `name`, `version`, `license`
* Add scripts to `package.json`
```json
  "scripts": {
    "styleguide:build": "gatsby build",
    "styleguide:develop": "gatsby develop"
  }
```
* `yarn add gatsby gatsby-theme-emulsify react react-dom`
* Create a `gatsby-config.js` with the following contents:
```
module.exports = {
  plugins: [
    {
      resolve: "gatsby-theme-emulsify",
      options: {
        componentLibPath: 'components',
        docPagesPath: 'styleguide',
        basePath: __dirname
      },
    },
  ],
}
```
* Create a `components` directory
  * This will hold your component library
  * Add a component
* Create a `styleguide` directory
  * This will hold custom pages for your styleguide
  * Add an `index.mdx` file