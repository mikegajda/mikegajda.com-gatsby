import { graphql, Link } from 'gatsby'
import React from 'react'
import get from 'lodash/get'

import { Post } from 'templates/Post'
import { LinkPost } from 'templates/LinkPost'
import { Image } from 'templates/Image'
import { Gallery } from 'templates/Gallery'
import { OGLink } from 'templates/OGLink'
import { Youtube } from 'templates/Youtube'
import Meta from 'components/Meta'
import Layout from 'components/Layout'

const NavLink = props => {
  if (props.next) {
    return (
      <Link
        className={
          'btn btn-primary float-right ' +
          (props.test ? 'disabled btn-secondary' : '')
        }
        to={props.url}
      >
        {props.text} <i class="fa fa-arrow-right ml-1" aria-hidden="true" />
      </Link>
    )
  } else {
    return (
      <Link
        className={
          'btn btn-primary float-left ' +
          (props.test ? 'disabled btn-secondary' : '')
        }
        to={props.url}
      >
        <i class="fa fa-arrow-left mr-1" aria-hidden="true" /> {props.text}
      </Link>
    )
  }
}

const BlogIndex = ({ data, pathContext }) => {
  console.log('DATA BLOG INDEX', data, pathContext)
  const posts = pathContext.group

  const { group, index, first, last, pageCount } = pathContext
  const previousUrl =
    index - 1 == 1
      ? '' + pathContext.pathPrefix
      : pathContext.pathPrefix + '/' + (index - 1).toString()
  const nextUrl = pathContext.pathPrefix + '/' + (index + 1).toString()

  return (
    <Layout location={'/'}>
      <Meta site={get(data, 'site.meta')} />
      <div className="px-0">
        {posts.map(function(post) {
          switch (post.node.remark.frontmatter.layout) {
            case 'Post':
              return Post(post.node)
            case 'LinkPost':
              return LinkPost(post.node)
            case 'Image':
              return Image(post.node)
            case 'Gallery':
              return Gallery(post.node)
            case 'OGLink':
              return OGLink(post.node, false)
            case 'Youtube':
              return Youtube(post.node)
            default:
              return Post(post.node)
          }
        })}

        <div className="container px-0 page-navigation clearfix">
          <NavLink
            next={false}
            test={first}
            url={previousUrl}
            text="Previous Page"
          />
          <NavLink next={true} test={last} url={nextUrl} text="Next Page" />
        </div>
      </div>
    </Layout>
  )
}

export default BlogIndex
export const pageQuery = graphql`
  query IndexPosts {
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
  }
`
