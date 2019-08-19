import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import React from 'react'
import map from 'lodash/map'
import Img from 'gatsby-image'
import Meta from '../../components/Meta/index'

import Footer from 'components/Footer'
import Layout from 'components/Layout'
import './style.scss'

const metascraper = require('metascraper')([
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-date')(),
  require('metascraper-url')(),
  require('metascraper-description')(),
  require('metascraper-publisher')(),
  require('metascraper-author')(),
])

function getMetaData(url) {
  ;(async () => {
    const { body: html, url } = await fetch(url)
    const metadata = await metascraper({
      html,
      url,
    })
    return metadata
  })()
}

export const LinkPost = node => {
  console.log('LinkPost received this node=', node)
  const html = node.remark.html
  const {
    category,
    tags,
    description,
    title,
    path,
    date,
    image,
    excerpt,
    link,
  } = node.remark.frontmatter
  const url = `/posts/${node.name}`

  let prettyLink = link
    .replace(/(^\w+:|^)\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0]

  let metadata = (async () => {
    return getMetaData(link).then(metadata => metadata)
  })()
  console.log('metadata', metadata)

  return (
    <article className="card my-4 container p-0" key={node.absolutePath}>
      <div className="card-header oglink-title">
        <a href={link} target="_blank" className="">
          <div className="h3 mb-0">{title}</div>

          <div className="text-muted" style={{ fontSize: '1rem' }}>
            <small>
              <i
                className="fa fa-external-link mr-1"
                style={{ fontSize: '.75rem' }}
                aria-hidden="true"
              />
            </small>
            {prettyLink}
          </div>
        </a>
        {excerpt && excerpt !== undefined && excerpt !== '' ? (
          <blockquote className={'my-2 rounded py-2 card-header-blockquote'}>
            <small className={'muted m-0 p-0 card-header-blockquote-excerpt'}>
              Excerpt
            </small>
            <div dangerouslySetInnerHTML={{ __html: excerpt }} />
          </blockquote>
        ) : (
          ''
        )}
      </div>
      {html && html !== undefined && html !== '' ? (
        <div className="card-body">
          <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
          <div>
            <a href={url}>Permalink</a>
          </div>
        </div>
      ) : (
        ''
      )}
    </article>
  )
}

const LinkPostContainer = ({ data, options }) => {
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
      <div className="container px-0">{LinkPost(node)}</div>
    </Layout>
  )
}

export default LinkPostContainer

export const pageQuery = graphql`
  query LinkPostByPath($absolutePath: String!) {
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
              excerpt
            }
          }
        }
      }
    }
  }
`
