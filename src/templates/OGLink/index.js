import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import React from 'react'
import map from 'lodash/map'
import Img from 'gatsby-image'
import Meta from '../../components/Meta/index'

import Footer from 'components/Footer'
import Layout from 'components/Layout'
import './style.scss'

export const OGLink = node => {
  console.log('OGLink received this node=', node)
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
  console.log('node og image =', image)
  const url = `${node.sourceInstanceName}/${node.relativeDirectory}/${
    node.name
  }`

  let prettyLink = link.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '')

  let cardImageTop = remoteImage ? remoteImage : image ? image : null

  return (
    <article className="card my-4" key={node.absolutePath}>
      {cardImageTop ? (
        <a href={og.url} className="text-muted card-img-top" target="_blank">
          <Img fluid={cardImageTop.fluid} className={'d-block card-img-top'} />
          <div class="ogimage-badge clearfix">
            <time
              className="badge badge-light p-2 text-muted float-right"
              dateTime={date}
            >
              <i class="fa fa-clock-o pr-1" aria-hidden="true" />
              {date}
            </time>
          </div>
        </a>
      ) : (
        ''
      )}

      <div className="card-header oglink-title">
        <a href={og.url ? og.url : link} className="">
          <div className="h3 mb-0">
            {og.title && og.title !== 'Terms of Service Violation'
              ? og.title
              : title}
          </div>
          {og.publisher ? (
            <div className="text-muted" style={{ fontSize: '1rem' }}>
              <small>
                <i
                  class="fa fa-external-link mr-1"
                  style={{ fontSize: '.75rem' }}
                  aria-hidden="true"
                />
              </small>
              {og.publisher}
            </div>
          ) : (
            ''
          )}
        </a>
      </div>
      <div className="card-body">
        {og.description ? (
          <blockquote className="p-3 rounded-right">
            {og.description}
          </blockquote>
        ) : (
          ''
        )}
        {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : ''}
      </div>
    </article>
  )
}

const OGLinkContainer = ({ data, options }) => {
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
      <div className="container px-0">{OGLink(node)}</div>
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
          id
          relativePath: relativePath
          relativeDirectory: relativeDirectory
          absolutePath
          name
          ext
          birthTime(formatString: "YYYY-MM-DD hh:mm:ss")
          changeTime(formatString: "YYYY-MM-DD hh:mm:ss")
          remark: childMarkdownRemark {
            id
            html
            frontmatter {
              title
              layout
              date(formatString: "YYYY/MM/DD")
              publishDate: date(formatString: "YYYY/MM/DD")
              category
              tags
              description
              link
            }
          }
        }
      }
    }
  }
`
