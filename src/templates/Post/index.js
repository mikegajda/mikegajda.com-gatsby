import { Link } from 'gatsby'
import get from 'lodash/get'
import React from 'react'
import map from 'lodash/map'
import Img from 'gatsby-image'

import Footer from 'components/Footer'
import './style.scss'

const Post = ({ data, options }) => {
  console.log('DATA', data)
  const {
    category,
    tags,
    description,
    title,
    path,
    date,
    image,
  } = data.edges[0].node.remark.frontmatter
  const { isIndex, adsense } = options
  const html = get(data, 'html')
  const isMore = isIndex && !!html.match('<!--more-->')
  const fixed = get(image, 'childImageSharp.fixed')

  if (fixed) {
    return (
      <div className="container px-0 my-3 card" key={path}>
        <Img
          className="card-img-top"
          fixed={fixed}
          style={{ display: 'block', margin: '0 auto' }}
        />
        <div className="card-header">
          <h2>
            <span>{title}</span>
            <small className="text-muted float-sm-right">
              {Badges({ items: [category], primary: true })}
            </small>
          </h2>
          <div>
            <time dateTime={date}>{date}</time>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="container px-0 my-2 card" key={path}>
        <div className="card-header">
          <h2 className="mb-0">
            <Link to={path}>{title}</Link>
            <div className="text-muted float-sm-right">
              <small>{Badges({ items: [category], primary: true })}</small>
            </div>
          </h2>
          <div>
            <time dateTime={date}>{date}</time>
          </div>
        </div>
        <div className="card-body">
          <p>{description}</p>
          <div
            className="content"
            dangerouslySetInnerHTML={{
              __html: isMore ? getDescription(html) : html,
            }}
          />
          {isMore ? Button({ path, label: 'MORE', primary: true }) : ''}
        </div>
      </div>
    )
  }
}

export default Post

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
        className={`p-2 badge ${primary ? 'badge-primary' : 'badge-secondary'}`}
        key={i}
      >
        {item}
      </span>
    )
  })
