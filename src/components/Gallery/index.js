var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

var _asyncToGenerator2 = _interopRequireDefault(
  require('@babel/runtime/helpers/asyncToGenerator')
)

// const select = require(`unist-util-select`)
const visitWithParents = require(`unist-util-visit-parents`)

const path = require(`path`)

const isRelativeUrl = require(`is-relative-url`)

const _ = require(`lodash`)

const _require = require(`gatsby-plugin-sharp`),
  fluid = _require.fluid

const Promise = require(`bluebird`)

const cheerio = require(`cheerio`)

const slash = require(`slash`) // If the image is relative (not hosted elsewhere)
//import React from "react"
const React = require('react')
// import Remark from 'remark'
const Remark = require(`remark`)
// import reactRenderer from 'remark-react'
const reactRenderer = require(`remark-react`)
// import { plugin, pluginOptions } from 'gatsby-remark-images'

const counterStyle = {
  /* styles skipped for brevity */
}

let remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true,
})

let plugins = [
  {
    resolve: `gatsby-remark-images`,
    options: {
      maxWidth: 750,
      linkImagesToOriginal: false,
      wrapperStyle: 'margin-bottom: 1.0725rem;',
    },
  },
  // {
  //   resolve: 'gatsby-remark-responsive-iframe',
  //   options: {
  //     wrapperStyle: 'margin-bottom: 1.0725rem',
  //   },
  // },
  // {
  //   resolve: "gatsby-remark-custom-blocks",
  //   options: {
  //     blocks: {
  //       gallery: "swiper-container",
  //       galleryWrapper: "swiper-wrapper",
  //       galleryItem: "swiper-slide"

  //     },
  //   },
  // }
]

for (let plugin of plugins) {
  const requiredPlugin = require(plugin)
  if (_.isFunction(requiredPlugin.setParserPlugins)) {
    for (let parserPlugin of requiredPlugin.setParserPlugins(
      plugin.pluginOptions
    )) {
      if (_.isArray(parserPlugin)) {
        const [parser, options] = parserPlugin
        remark = remark.use(parser, options)
      } else {
        remark = remark.use(parserPlugin)
      }
    }
  }
}

export default class Counter extends React.Component {
  static defaultProps = {
    initialvalue: 0,
  }

  state = {
    value: Number(this.props.initialvalue),
  }

  handleIncrement = () => {
    this.setState(state => {
      return {
        value: state.value + 1,
      }
    })
  }

  handleDecrement = () => {
    this.setState(state => {
      return {
        value: state.value - 1,
      }
    })
  }

  componentDidMount() {}

  render() {
    console.log('PROPS', this.props)
    const { children } = this.props

    return (
      <span style={counterStyle}>
        <strong style={{ flex: `1 1` }}>{this.state.value}</strong>
        <button onClick={this.handleDecrement}>-1</button>
        <button onClick={this.handleIncrement}>+1</button>
        {
          remark
            .use(reactRenderer)
            .processSync('![alt text](./IMG_2531.jpg "Logo Title Text 1")')
            .contents
        }
      </span>
    )
  }
}
