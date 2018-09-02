import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import React from 'react'
import map from 'lodash/map'
import Img from 'gatsby-image'
import Meta from '../../components/Meta/index'

import Footer from 'components/Footer'
import Layout from 'components/Layout'
import './style.scss'

export const Youtube = node => {
  console.log('OGLink received this node=', node)
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
    og,
  } = node.remark.frontmatter
  const url = `${node.sourceInstanceName}/${node.relativeDirectory}/${
    node.name
  }`

  let prettyLink = link.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '')

  if (og && og.ogType === 'video.other') {
    return (
      <article className="card my-4 rounded" key={node.absolutePath}>
        <div class="embed-responsive embed-responsive-16by9 card-img-top">
          <iframe
            class="embed-responsive-item"
            src={og.ogVideo.url}
            allowfullscreen
          />
        </div>
        <div className="card-header">
          <a href={og.ogUrl} className="text-muted">
            <small>
              <i class="fa fa-external-link mr-1" aria-hidden="true" />
            </small>
            {og.ogUrl}
          </a>
        </div>
        <div className="card-body">
          {og.ogDescription ? (
            <blockquote className="p-3 rounded-right">
              {og.ogDescription}
            </blockquote>
          ) : (
            ''
          )}
          {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : ''}
        </div>
      </article>
    )
  } else {
    return (
      <article className="card my-4 rounded" key={node.absolutePath}>
        <div className="card-header">
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
}

const YoutubeContainer = ({ data, options }) => {
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
      <div className="container px-0">{Youtube(node)}</div>
    </Layout>
  )
}

export default YoutubeContainer

export const pageQuery = graphql`
  query YoutubeQueryByPath($absolutePath: String!) {
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
