import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import React from 'react'
import map from 'lodash/map'
import Img from 'gatsby-image'
import Meta from '../../components/Meta/index'

import Footer from 'components/Footer'
import Layout from 'components/Layout'
import './style.scss'

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
    link,
  } = node.remark.frontmatter
  const url = `/posts/${node.name}`

  let prettyLink = link.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '')

  return (
    <article className="card my-4" key={node.absolutePath}>
      <div className="card-header linkpost-card-header">
        <a href={link} className="text-muted">
          <small>
            <i class="fa fa-external-link mr-1" aria-hidden="true" />
          </small>
          {prettyLink}
        </a>
      </div>
      <div className="card-body">
        <h1 className="">
          <Link className="" to={url}>
            {title}
          </Link>
        </h1>
        <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
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
            }
          }
        }
      }
    }
  }
`
