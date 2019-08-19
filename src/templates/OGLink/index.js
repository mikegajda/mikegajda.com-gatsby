import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import React from 'react'
import map from 'lodash/map'
import Img from 'gatsby-image'
import Meta from '../../components/Meta/index'

import Footer from 'components/Footer'
import Layout from 'components/Layout'
import './style.scss'

export const OGLink = (node, shouldShowPermalink) => {
  console.info('OGLink received this node=', node)
  const html = node.remark.html
  const {
    category,
    tags,
    description,
    title,
    path,
    date,
    link,
  } = node.remark.frontmatter
  const og = node.remark.og
  const image =
    node.remark.og && node.remark.og.image
      ? node.remark.og.image.childImageSharp
      : undefined
  const remoteImage = node.remark.remoteImage
    ? node.remark.remoteImage.image.childImageSharp
    : undefined
  //console.info('node og image =', image)
  const url = `/${node.sourceInstanceName}/${node.name}`

  console.log('url = ', url)

  let prettyLink = link.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '')

  let websiteHostname = link
    .replace(/(^\w+:|^)\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0]

  let cardImageTop = remoteImage ? remoteImage : image ? image : null

  return (
    <article className="container p-0 card my-4" key={node.absolutePath}>
      <div className="card-header oglink-title">
        <a href={link} className="">
          <div className="h3 mb-0">{title}</div>

          <div className="text-muted" style={{ fontSize: '1rem' }}>
            <small>
              <i
                class="fa fa-external-link mr-1"
                style={{ fontSize: '.75rem' }}
                aria-hidden="true"
              />
            </small>
            {websiteHostname}
          </div>
        </a>
      </div>
      <div className="card-body">
        {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : ''}
        {shouldShowPermalink ? (
          <div
            className="text-muted float-right pt-2"
            style={{ fontSize: '1rem' }}
          >
            <small>
              <i
                class="fa fa-link mr-1"
                style={{ fontSize: '.75rem' }}
                aria-hidden="true"
              />
              <Link to={'/posts/' + node.name}>Permalink</Link>
            </small>
          </div>
        ) : (
          ''
        )}
      </div>
    </article>
  )
}

const OGLinkContainer = ({ data, options }) => {
  //console.info('DATA = ', data)
  const {
    category,
    tags,
    description,
    title,
    path,
    date,
    image,
    link,
  } = data.post.edges[0].node.remark.frontmatter
  const isIndex = false
  // const { isIndex, adsense } = options
  const html = get(data.post.edges[0].node.remark, 'html')
  // const fixed = get(image, 'childImageSharp.fixed')

  let node = data.post.edges[0].node
  return (
    <Layout
      location={`${data.post.edges[0].node.sourceInstanceName}/${
        data.post.edges[0].node.relativeDirectory
      }/${data.post.edges[0].node.name}`}
    >
      <Meta site={get(data, 'site.meta')} />
      <div className="container px-0">{OGLink(node, false)}</div>
    </Layout>
  )
}

export default OGLinkContainer

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
  query LinkQueryByPath($absolutePath: String!) {
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
