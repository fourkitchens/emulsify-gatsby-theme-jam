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
            name: "Acme Corporation",
            link: "/"
          },
        ],
        // Site Metadata for style guide
        siteMetadata: {
          title: "Acme Corporation",
          description: "Your favorite fictional company",
          author: "Acme Corporation",
        }
      },
    },
  ],
}
