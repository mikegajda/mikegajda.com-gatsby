import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import React from 'react'
import map from 'lodash/map'
import Img from 'gatsby-image'
import Meta from '../../components/Meta/index'

import Footer from 'components/Footer'
import Layout from 'components/Layout'
import './style.scss'

export const Image = node => {
  const html = node.remark.html
  const {
    category,
    tags,
    description,
    title,
    path,
    date,
    image,
    link,
  } = node.remark.frontmatter
  const url = `${node.sourceInstanceName}/${node.relativeDirectory}/${
    node.name
  }`

  const fluid = get(node, 'remark.frontmatter.image.childImageSharp.fluid')

  return (
    <article
      className="container container-wide p-0 card my-4 shadow"
      key={node.absolutePath}
    >
      <Img
        className="card-img-top"
        fluid={fluid}
        style={{ display: 'block', margin: '0 auto' }}
      />
      <div className="card-footer">
        <span className="text-muted">{title}</span>
        <time className="text-muted float-right" dateTime={date}>
          {date}
        </time>
      </div>
    </article>
  )
}

const ImageContainer = ({ data, options }) => {
  const {
    category,
    tags,
    description,
    title,
    path,
    date,
    image,
  } = data.post.edges[0].node.remark.frontmatter
  const isIndex = false
  // const { isIndex, adsense } = options
  const html = get(data.post.edges[0].node.remark, 'html')
  const isMore = isIndex && !!html.match('<!--more-->')
  // const fixed = get(image, 'childImageSharp.fixed')

  let node = data.post.edges[0].node

  return (
    <Layout
      location={`${data.post.edges[0].node.sourceInstanceName}/${
        data.post.edges[0].node.relativeDirectory
      }/${data.post.edges[0].node.name}`}
    >
      <Meta site={get(data, 'site.meta')} />
      <div className="container px-0">{Image(node)}</div>
    </Layout>
  )
}

export default ImageContainer

const getDescription = body => {
  body = body.replace(/<blockquote>/g, '<blockquote class="blockquote">')
  if (body.match('<!--more-->')) {
    body = body.split('<!--more-->')
    if (typeof body[0] !== 'undefined') {
      return body[0]
    }
  }
  return body
}

const Button = ({ path, label, primary }) => (
  <Link className="readmore" to={path}>
    <span
      className={`btn btn-outline-primary btn-block ${
        primary ? 'btn-outline-primary' : 'btn-outline-secondary'
      }`}
    >
      {label}
    </span>
  </Link>
)

const Badges = ({ items, primary }) =>
  map(items, (item, i) => {
    return (
      <span
        className={`p-2 badge ${primary ? 'badge-primary' : 'badge-white'}`}
        key={i}
      >
        <i class="fa fa-tags" />
        {item}
      </span>
    )
  })

export const pageQuery = graphql`
  query ImagePostByPath($absolutePath: String!) {
    site {
      meta: siteMetadata {
        title
        description
        url: siteUrl
        author
        twitter
        adsense
      }
    }
    post: allFile(filter: { absolutePath: { eq: $absolutePath } }) {
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
            remoteImage: childRemoteimage {
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
            }
            og: childOpengraph {
              url
              description
              title
              publisher
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
              captions
              remoteImage
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
