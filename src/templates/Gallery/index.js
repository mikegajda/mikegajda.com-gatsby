import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import React from 'react'
import map from 'lodash/map'
import Img from 'gatsby-image'
import Meta from '../../components/Meta/index'

import Footer from 'components/Footer'
import Layout from 'components/Layout'
import './style.scss'

import Swiper from 'react-id-swiper'

export const Gallery = node => {
  console.log('Gallery received this node=', node)
  const html = node.remark.html
  const {
    category,
    tags,
    description,
    title,
    path,
    date,
    images,
    link,
    captions,
  } = node.remark.frontmatter
  const url = `${node.sourceInstanceName}/${node.relativeDirectory}/${
    node.name
  }`

  const params = {
    navigation: {
      nextEl: '.swiper-button-next.swiper-button-black',
      prevEl: '.swiper-button-prev.swiper-button-black',
    },
    // pagination: {
    //   el: '.swiper-pagination.swiper-pagination-black',
    //   type: 'bullets',
    // },
    spaceBetween: 10,
    zoom: false,
    centeredSlides: true,
    keyboard: true,
    onlyInViewport: true,
  }

  return (
    <article className="card shadow my-4">
      <div className="card-header">
        <Link
          className="text-muted"
          to={`${node.sourceInstanceName}/${node.relativeDirectory}/${
            node.name
          }`}
        >
          {title}
        </Link>
        <time className="text-muted float-right" dateTime={date}>
          {date}
        </time>
      </div>
      <div className="">
        <Swiper {...params}>
          {images.map((image, index) => (
            <div className="">
              <Img sizes={image.childImageSharp.fixed} />
              <div className="p-3 pb-0 text-center text-muted">
                {' '}
                {captions[index] ? captions[index] : '...'}
              </div>
            </div>
          ))}
        </Swiper>
      </div>
      <div
        className="card-body pt-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  )
}

const GalleryContainer = ({ data, options }) => {
  const {
    category,
    tags,
    description,
    title,
    path,
    date,
    images,
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
      <div className="container px-0">{Gallery(node)}</div>
    </Layout>
  )
}

export default GalleryContainer

export const pageQuery = graphql`
  query GalleryByPath($absolutePath: String!) {
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
              captions
              images {
                childImageSharp {
                  fixed(width: 738, height: 555, cropFocus: ATTENTION) {
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
