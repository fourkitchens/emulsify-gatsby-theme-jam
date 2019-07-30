module.exports = {
  plugins: [
    {
      resolve: "gatsby-theme-emulsify",
      options: {
        componentLibPath: 'components',
        docPagesPath: 'styleguide',
        basePath: __dirname,
        designSystems: [
          {
            name: "B&E Security",
            link: "/"
          },
          {
            name: "Acme Design System",
            link: "https://acme-design-system-emulsify.netlify.com/"
          }
        ],
        // Site Metadata for style guide
        siteMetadata: {
          title: "B&E Security",
          description: "Your favorite security company",
          author: "B&E Security",
        }
      },
    },
  ],
}
