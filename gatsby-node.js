const each = require('lodash/each')
const Promise = require('bluebird')
const path = require('path')
const Post = path.resolve('./src/templates/Post/index.js')
const LinkPost = path.resolve('./src/templates/LinkPost/index.js')
const Image = path.resolve('./src/templates/Image/index.js')
const Gallery = path.resolve('./src/templates/Gallery/index.js')
const OGLink = path.resolve('./src/templates/OGLink/index.js')
const Youtube = path.resolve('./src/templates/Youtube/index.js')
const createPaginatedPages = require('gatsby-paginate')
const ogs = require('open-graph-scraper')

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
                      link
                      date(formatString: "YYYY/MM/DD")
                      publishDate: date
                      category
                      tags
                      description
                      captions
                      image {
                        childImageSharp {
                          fluid(maxWidth: 738) {
                            tracedSVG
                            aspectRatio
                            src
                            srcSet
                            srcWebp
                            srcSetWebp
                            sizes
                          }
                        }
                      }
                      images {
                        childImageSharp {
                          fixed(width: 708, height: 555, cropFocus: ATTENTION) {
                            tracedSVG
                            aspectRatio
                            src
                            srcSet
                            srcWebp
                            srcSetWebp
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
      )
        .then(({ errors, data }) => {
          if (errors) {
            console.log(errors)
            reject(errors)
          }
          return data.allFile.edges
        })
        .then(posts => {
          posts.sort(function(a, b) {
            a = new Date(a.node.remark.frontmatter.publishDate)
            b = new Date(b.node.remark.frontmatter.publishDate)
            return a > b ? -1 : a < b ? 1 : 0
          })
          return posts
        })
        .then(posts => {
          //console.log("posts", posts)
          postPromises = []
          for (let i = 0; i < posts.length; i++) {
            if (posts[i].node.remark.frontmatter.link) {
              postPromises.push(
                new Promise(function(resolve, reject) {
                  ogs({
                    url: posts[i].node.remark.frontmatter.link,
                    timeout: 1000,
                  })
                    .then(result => {
                      console.log('success')
                      posts[i].node.remark.frontmatter.og = result.data
                      resolve(posts[i])
                      return
                    })
                    .catch(error => {
                      resolve(posts[i])
                      return
                    })
                  //setTimeout(resolve, 100, 'foo');
                })
              )
            } else {
              postPromises.push(
                new Promise(function(resolve, reject) {
                  resolve(posts[i])
                  return
                })
              )
            }
          }

          let promised = Promise.all(postPromises).then(function(promised) {
            console.log('posts promised', promised)
            return promised
          })

          return promised
        })
        .then(posts => {
          createPaginatedPages({
            edges: posts,
            createPage: createPage,
            pageTemplate: 'src/templates/index.js',
            pageLength: 5, // This is optional and defaults to 10 if not used
            pathPrefix: '', // This is optional and defaults to an empty string if not used
            context: {}, // This is optional and defaults to an empty object if not used
          })
          each(posts, ({ node }) => {
            if (!node.remark) return
            const absolutePath = node.absolutePath
            switch (node.remark.frontmatter.layout) {
              case 'Post':
                return createPage({
                  path: `/posts/${node.relativeDirectory}/${node.name}`,
                  component: Post,
                  context: {
                    absolutePath,
                  },
                })
              case 'LinkPost':
                return createPage({
                  path: `/posts/${node.relativeDirectory}/${node.name}`,
                  component: LinkPost,
                  context: {
                    absolutePath,
                  },
                })
              case 'Image':
                return createPage({
                  path: `/images/${node.relativeDirectory}/${node.name}`,
                  component: Image,
                  context: {
                    absolutePath,
                  },
                })
              case 'Gallery':
                return createPage({
                  path: `/galleries/${node.relativeDirectory}/${node.name}`,
                  component: Gallery,
                  context: {
                    absolutePath,
                  },
                })
              case 'OGLink':
                return createPage({
                  path: `/posts/${node.relativeDirectory}/${node.name}`,
                  component: OGLink,
                  context: {
                    absolutePath,
                  },
                })
              case 'Youtube':
                return createPage({
                  path: `/posts/${node.relativeDirectory}/${node.name}`,
                  component: Youtube,
                  context: {
                    absolutePath,
                  },
                })
              default:
                return createPage({
                  path: `/posts/${node.relativeDirectory}/${node.name}`,
                  component: Post,
                  context: {
                    absolutePath,
                  },
                })
            }
          })
          return
        })
    )
  })
}

// each(posts, ({ node }) => {
//   console.log('node = ', node.remark.frontmatter.title)
//   if (!node.remark) return
//   const absolutePath = node.absolutePath
//   switch (node.remark.frontmatter.layout) {
//     case 'Post':
//       return createPage({
//         path: `/posts/${node.relativeDirectory}/${node.name}`,
//         component: Post,
//         context: {
//           absolutePath,
//         },
//       })
//     case 'LinkPost':
//       return createPage({
//         path: `/posts/${node.relativeDirectory}/${node.name}`,
//         component: LinkPost,
//         context: {
//           absolutePath,
//         },
//       })
//     case 'Image':
//       return createPage({
//         path: `/images/${node.relativeDirectory}/${node.name}`,
//         component: Image,
//         context: {
//           absolutePath,
//         },
//       })
//     case 'Gallery':
//       return createPage({
//         path: `/galleries/${node.relativeDirectory}/${node.name}`,
//         component: Gallery,
//         context: {
//           absolutePath,
//         },
//       })
//     case 'OGLink':
//       return createPage({
//         path: `/posts/${node.relativeDirectory}/${node.name}`,
//         component: OGLink,
//         context: {
//           absolutePath,
//         },
//       })
//     case 'Youtube':
//       return createPage({
//         path: `/posts/${node.relativeDirectory}/${node.name}`,
//         component: Youtube,
//         context: {
//           absolutePath,
//         },
//       })
//     default:
//       return createPage({
//         path: `/posts/${node.relativeDirectory}/${node.name}`,
//         component: Post,
//         context: {
//           absolutePath,
//         },
//       })
//   }
// })

// resolve(
//   graphql(
//     `
//       {
//         allFile(
//           filter: { internal: { mediaType: { in: ["text/markdown"] } } }
//         ) {
//           edges {
//             node {
//               id: absolutePath
//               relativePath
//               relativeDirectory
//               absolutePath
//               sourceInstanceName
//               name
//               ext
//               birthTime(formatString: "YYYY-MM-DD hh:mm:ss")
//               changeTime(formatString: "YYYY-MM-DD hh:mm:ss")
//               remark: childMarkdownRemark {
//                 id
//                 html
//                 frontmatter {
//                   layout
//                   title
//                   link
//                   date(formatString: "YYYY/MM/DD")
//                   publishDate: date
//                   category
//                   tags
//                   description
//                   captions
//                   image {
//                     childImageSharp {
//                       fluid(maxWidth: 738) {
//                         tracedSVG
//                         aspectRatio
//                         src
//                         srcSet
//                         srcWebp
//                         srcSetWebp
//                         sizes
//                       }
//                     }
//                   }
//                   images {
//                     childImageSharp {
//                       fixed(width: 708, height: 555, cropFocus: ATTENTION) {
//                         tracedSVG
//                         aspectRatio
//                         src
//                         srcSet
//                         srcWebp
//                         srcSetWebp
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     `
//   ).then(({ errors, data }) => {
//     if (errors) {
//       console.log(errors)
//       reject(errors)
//     }

//     // Create blog posts & pages.
//     const posts = data.allFile.edges
//     console.log('POSTS LENGTH', posts.length)
//     //const posts = items.filter(({ node }) => /posts/.test(node.name))

//     posts.sort(function(a, b) {
//       a = new Date(a.node.remark.frontmatter.publishDate)
//       b = new Date(b.node.remark.frontmatter.publishDate)
//       return a > b ? -1 : a < b ? 1 : 0
//     })

//     postPromises = [];
//     for(let i =0; i < posts.length; i++){
//       postPromises.push(
//         new Promise(function(resolve, reject) {
//           ogs({
//             url: posts[i].node.remark.frontmatter.link,
//             timeout: 4000,
//           }).then((result) => {
//             console.log(result);
//             resolve(result);
//           })
//           //setTimeout(resolve, 100, 'foo');
//         })
//       )
//     }

//     Promise.all(postPromises).then(function(posts) {
//       console.log("posts", posts);
//     });

//     // var posts = await Promise.map(posts, async (post) => {
//     //   await ogs({url: post.node.remark.frontmatter.link});
//     //   return post
//     // });

//     // for(let i =0; i < posts.length; i++){
//     //   if (post.node.remark.frontmatter.link) {
//     //     let options = {
//     //       url: post.node.remark.frontmatter.link,
//     //       timeout: 4000,
//     //     }
//     //     ogs(options, function(error, results) {
//     //       console.log('ogs', error, results)
//     //       if (!error) {
//     //         post.node.remark.frontmatter.og = results.data
//     //       }
//     //     })
//     //   if (i === (posts.length-1))
//     // }

//     // posts.forEach(function(post) {
//     //   if (post.node.remark.frontmatter.link) {
//     //     let options = {
//     //       url: post.node.remark.frontmatter.link,
//     //       timeout: 4000,
//     //     }
//     //     ogs(options, function(error, results) {
//     //       console.log('ogs', error, results)
//     //       if (!error) {
//     //         post.node.remark.frontmatter.og = results.data
//     //       }
//     //     })
//     //   }
//     // })

//     createPaginatedPages({
//       edges: posts,
//       createPage: createPage,
//       pageTemplate: 'src/templates/index.js',
//       pageLength: 5, // This is optional and defaults to 10 if not used
//       pathPrefix: '', // This is optional and defaults to an empty string if not used
//       context: {}, // This is optional and defaults to an empty object if not used
//     })
//     each(posts, ({ node }) => {
//       console.log('node = ', node.remark.frontmatter.title)
//       if (!node.remark) return
//       const absolutePath = node.absolutePath
//       switch (node.remark.frontmatter.layout) {
//         case 'Post':
//           return createPage({
//             path: `/posts/${node.relativeDirectory}/${node.name}`,
//             component: Post,
//             context: {
//               absolutePath,
//             },
//           })
//         case 'LinkPost':
//           return createPage({
//             path: `/posts/${node.relativeDirectory}/${node.name}`,
//             component: LinkPost,
//             context: {
//               absolutePath,
//             },
//           })
//         case 'Image':
//           return createPage({
//             path: `/images/${node.relativeDirectory}/${node.name}`,
//             component: Image,
//             context: {
//               absolutePath,
//             },
//           })
//         case 'Gallery':
//           return createPage({
//             path: `/galleries/${node.relativeDirectory}/${node.name}`,
//             component: Gallery,
//             context: {
//               absolutePath,
//             },
//           })
//         case 'OGLink':
//           return createPage({
//             path: `/posts/${node.relativeDirectory}/${node.name}`,
//             component: OGLink,
//             context: {
//               absolutePath,
//             },
//           })
//         case 'Youtube':
//           return createPage({
//             path: `/posts/${node.relativeDirectory}/${node.name}`,
//             component: Youtube,
//             context: {
//               absolutePath,
//             },
//           })
//         default:
//           return createPage({
//             path: `/posts/${node.relativeDirectory}/${node.name}`,
//             component: Post,
//             context: {
//               absolutePath,
//             },
//           })
//       }
//     })

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
