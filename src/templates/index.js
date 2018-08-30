import { graphql, Link } from 'gatsby'
import React from 'react'
import get from 'lodash/get'

import { Post } from 'templates/Post'
import { LinkPost } from 'templates/LinkPost'
import Meta from 'components/Meta'
import Layout from 'components/Layout'

const NavLink = props => {
  if (!props.test) {
    return <Link to={props.url}>{props.text}</Link>
  } else {
    return <span>{props.text}</span>
  }
}

const BlogIndex = ({ data, pathContext }) => {
  console.log('DATA BLOG INDEX', data)
  const posts = pathContext.group

  const { group, index, first, last, pageCount } = pathContext
  const previousUrl = index - 1 == 1 ? '' : (index - 1).toString()
  const nextUrl = (index + 1).toString()

  return (
    <Layout location={index === 0 ? '/' : index.toString()}>
      <Meta site={get(data, 'site.meta')} />
      <div className="container px-0">
        {posts.map(function(post) {
          switch (post.node.remark.frontmatter.layout) {
            case 'Post':
              return Post(post.node)
            case 'LinkPost':
              return LinkPost(post.node)
            default:
              return Post(post.node)
          }
        })}
      </div>

      <div className="previousLink">
        <NavLink test={first} url={previousUrl} text="Go to Previous Page" />
      </div>
      <div className="nextLink">
        <NavLink test={last} url={nextUrl} text="Go to Next Page" />
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
