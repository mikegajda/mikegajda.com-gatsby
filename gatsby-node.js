const each = require('lodash/each')
const Promise = require('bluebird')
const path = require('path')
const PostTemplate = path.resolve('./src/templates/Post/index.js')
const createPaginatedPages = require('gatsby-paginate')

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allFile(
              filter: { internal: { mediaType: { in: ["text/markdown"] } } }
            ) {
              edges {
                node {
                  id: absolutePath
                  relativePath
                  relativeDirectory
                  absolutePath
                  sourceInstanceName
                  name
                  ext
                  birthTime(formatString: "YYYY-MM-DD hh:mm:ss")
                  changeTime(formatString: "YYYY-MM-DD hh:mm:ss")
                  remark: childMarkdownRemark {
                    id
                    html
                    frontmatter {
                      layout
                      title
                      date(formatString: "YYYY/MM/DD")
                      publishDate: date
                      category
                      tags
                      description
                      image {
                        childImageSharp {
                          id
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
      ).then(({ errors, data }) => {
        if (errors) {
          console.log(errors)
          reject(errors)
        }

        // Create blog posts & pages.
        const posts = data.allFile.edges
        console.log('POSTS', posts)
        //const posts = items.filter(({ node }) => /posts/.test(node.name))

        data.allFile.edges.sort(function(a, b) {
          a = new Date(a.node.remark.frontmatter.publishDate)
          b = new Date(b.node.remark.frontmatter.publishDate)
          return a > b ? -1 : a < b ? 1 : 0
        })

        createPaginatedPages({
          edges: data.allFile.edges,
          createPage: createPage,
          pageTemplate: 'src/templates/index.js',
          pageLength: 2, // This is optional and defaults to 10 if not used
          pathPrefix: '', // This is optional and defaults to an empty string if not used
          context: {}, // This is optional and defaults to an empty object if not used
        })
        each(posts, ({ node }) => {
          if (!node.remark) return
          const absolutePath = node.absolutePath
          createPage({
            path: `/posts/${node.relativeDirectory}/${node.name}`,
            component: PostTemplate,
            context: {
              absolutePath,
            },
          })
        })

        // const pages = items.filter(({ node }) => /page/.test(node.name))
        // each(pages, ({ node }) => {
        //   if (!node.remark) return
        //   const { name } = path.parse(node.path)
        //   const PageTemplate = path.resolve(node.path)
        //   createPage({
        //     path: name,
        //     component: PageTemplate,
        //   })
        // })
      })
    )
  })
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        components: path.resolve(__dirname, 'src/components'),
        templates: path.resolve(__dirname, 'src/templates'),
        scss: path.resolve(__dirname, 'src/scss'),
      },
    },
  })
}
