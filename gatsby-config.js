module.exports = {
  siteMetadata: {
    title: 'Mike Gajda',
    description: "Mike Gajda's personal website",
    siteUrl: 'https://mikegajda.com',
    author: 'Mike Gajda',
    twitter: 'mikegajda',
    adsense: '',
  },
  pathPrefix: '/',
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/content/posts/`,
        name: 'posts',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/content/images/`,
        name: 'images',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/content/galleries/`,
        name: 'galleries',
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 750,
              linkImagesToOriginal: false,
              wrapperStyle: 'margin-bottom: 1.0725rem;',
            },
          },
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: {
              wrapperStyle: 'margin-bottom: 1.0725rem',
            },
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-smartypants',
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Mike Gajda',
        short_name: 'mikegajda',
        description: "Mike Gajda's personal website",
        homepage_url: 'https://mikegajda.com',
        start_url: '/',
        background_color: '#fff',
        theme_color: '#01bc84',
        display: 'standalone',
        icons: [
          {
            src: '/img/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/img/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: '',
      },
    },
    `gatsby-transformer-open-graph`,
    `gatsby-transformer-remote-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    'gatsby-plugin-catch-links',
    'gatsby-plugin-offline',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-react-next',
    'gatsby-plugin-sass',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-twitter',
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allFile } }) => {
              return allFile.edges.map(edge => {
                let node = edge.node
                switch (node.remark.frontmatter.layout) {
                  case 'Post':
                    return Object.assign({}, node.frontmatter, {
                      title: node.remark.frontmatter.title,
                      description: node.remark.html,
                      url: site.siteMetadata.siteUrl + `/posts/${node.name}`,
                      guid: site.siteMetadata.siteUrl + node.id,
                      custom_elements: [
                        { 'content:encoded': node.remark.html },
                      ],
                      date: node.remark.publishDate,
                      ttl: 1,
                    })
                  // case 'LinkPost':
                  //   return LinkPost(post.node)
                  // case 'Image':
                  //   return Image(post.node)
                  // case 'Gallery':
                  //   return Gallery(post.node)
                  case 'OGLink':
                    return Object.assign({}, node.frontmatter, {
                      title:
                        node.remark.og && node.remark.og.title
                          ? node.remark.og.title
                          : node.remark.frontmatter.title,
                      description: node.remark.frontmatter.html,
                      url:
                        node.remark.og && node.remark.og.url
                          ? node.remark.og.url
                          : site.siteMetadata.siteUrl + `/posts/${node.name}`,
                      guid: site.siteMetadata.siteUrl + node.id,
                      custom_elements: [
                        { 'content:encoded': node.remark.html },
                      ],
                      date: node.remark.frontmatter.publishDate,
                      ttl: 1,
                    })
                  case 'Youtube':
                    return Object.assign({}, node.frontmatter, {
                      title:
                        node.remark.og && node.remark.og.title
                          ? node.remark.og.title
                          : node.remark.frontmatter.title,
                      description: node.remark.html,
                      url:
                        node.remark.og && node.remark.og.url
                          ? node.remark.og.url
                          : site.siteMetadata.siteUrl + `/posts/${node.name}`,
                      guid: site.siteMetadata.siteUrl + node.id,
                      custom_elements: [
                        { 'content:encoded': node.remark.html },
                      ],
                      date: node.remark.frontmatter.publishDate,
                      ttl: 1,
                    })
                  default:
                    return Object.assign({}, node.frontmatter, {
                      title:
                        node.remark.og && node.remark.og.title
                          ? node.remark.og.title
                          : node.remark.frontmatter.title,
                      description: node.remark.html,
                      url: site.siteMetadata.siteUrl + `/posts/${node.name}`,
                      guid: site.siteMetadata.siteUrl + node.id,
                      custom_elements: [
                        { 'content:encoded': node.remark.html },
                      ],
                      date: node.remark.frontmatter.publishDate,
                      ttl: 1,
                    })
                }
              })
            },
            query: `
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
                    og: childOpengraph {
                      url
                      description
                      title
                      publisher
                    }
                    frontmatter {
                      layout
                      title
                      link
                      date(formatString: "YYYY/MM/DD")
                      publishDate: date
                      category
                      tags
                      description
                    }
                  }
                }
              }
            }
          }
        `,
            output: '/rss.xml',
          },
        ],
      },
    },

    {
      resolve: 'gatsby-plugin-netlify',
      options: {
        mergeSecurityHeaders: true,
        mergeLinkHeaders: true,
        mergeCachingHeaders: true,
      },
    },
  ],
}
