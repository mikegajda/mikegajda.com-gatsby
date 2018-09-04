const crypto = require(`crypto`)
const axios = require(`axios`)
const Queue = require(`better-queue`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

async function getMetadata(targetUrl) {
  const { body: html, url } = await got(targetUrl)
  const metadata = await metascraper({ html, url })
  return metadata
}

const metascraper = require('metascraper')([
  require('metascraper-image')(),
  require('metascraper-title')(),
  require('metascraper-date')(),
  require('metascraper-url')(),
  require('metascraper-description')(),
  require('metascraper-publisher')(),
  require('metascraper-author')(),
])

const got = require('got')

function getMetaData(url) {
  ;(async () => {
    const { body: html, url } = await got(targetUrl)
    const metadata = await metascraper({ html, url })
    return metadata
  })()
}

const SCREENSHOT_ENDPOINT = `https://h7iqvn4842.execute-api.us-east-2.amazonaws.com/prod/opengraph`
const LAMBDA_CONCURRENCY_LIMIT = 50

const opengraphQueue = new Queue(
  (input, cb) => {
    createOpengraphNode(input)
      .then(r => cb(null, r))
      .catch(e => cb(e))
  },
  { concurrent: LAMBDA_CONCURRENCY_LIMIT, maxRetries: 10, retryDelay: 1000 }
)

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

exports.onPreBootstrap = (
  { store, cache, actions, createNodeId, getNodes },
  pluginOptions
) => {
  const { createNode, touchNode } = actions
  const opengraphNodes = getNodes().filter(n => n.internal.type === `Opengraph`)

  if (opengraphNodes.length === 0) {
    return null
  }

  let anyQueued = false

  // Check for updated opengraphs
  // and prevent Gatsby from garbage collecting remote file nodes
  opengraphNodes.forEach(n => {
    anyQueued = true
    // Opengraph expired, re-run Lambda
    opengraphQueue.push({
      url: n.url,
      parent: n.parent,
      store,
      cache,
      createNode,
      createNodeId,
    })
  })

  if (!anyQueued) {
    return null
  }

  return new Promise((resolve, reject) => {
    opengraphQueue.on(`drain`, () => {
      resolve()
    })
  })
}

exports.onCreateNode = async ({
  node,
  actions,
  store,
  cache,
  createNodeId,
}) => {
  const { createNode, createParentChildLink } = actions

  //console.log("node.internal.type=", node.internal.type)

  // We only care about parsed sites.yaml files with a url field
  if (node.internal.type !== `MarkdownRemark`) {
    return
  } else {
    if (!node.frontmatter.link) {
      return
    }
  }

  const opengraphNode = await new Promise((resolve, reject) => {
    opengraphQueue
      .push({
        url: node.frontmatter.link,
        parent: node.id,
        store,
        cache,
        createNode,
        createNodeId,
      })
      .on(`finish`, r => {
        resolve(r)
      })
      .on(`failed`, e => {
        reject(e)
      })
  })

  createParentChildLink({
    parent: node,
    child: opengraphNode,
  })
}

const createOpengraphNode = async ({
  url,
  parent,
  store,
  cache,
  createNode,
  createNodeId,
}) => {
  try {
    console.log('process opengraph data for = ', url)

    const targetUrl = url

    const metadata = await getMetadata(targetUrl)
    // ;(async () => {
    //   const {body: html, url} = await got(targetUrl)
    //   const metadata = await metascraper({html, url})
    // })()

    //console.log("META DATA", metadata)
    //const opengraphResponse = await axios.post(SCREENSHOT_ENDPOINT, { url })
    // const opengraphResponse = {
    //   data: {
    //     url:
    //       'https://cdn.vox-cdn.com/thumbor/oQHsce6Ez49l4rdP4QbHa-PIetE=/0x0:2040x1360/1220x813/filters:focal(857x517:1183x843):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/61115509/acastro_180416_1777_chrome_0001.0.jpg',
    //   },
    // }

    //const {newUrl, description, publisher, title, date} = metadata

    console.log('image = ', metadata.image)
    let fixedImageUrl = metadata.image
    if (metadata.image.includes('wsj')) {
      fixedImageUrl = fixedImageUrl + '?image.jpg'
    }

    const fileNode = await createRemoteFileNode({
      url: fixedImageUrl,
      store,
      cache,
      createNode,
      createNodeId,
    })

    if (!fileNode) {
      throw new Error(`Remote file node is null`, metadata.image)
    }

    const opengraphNode = {
      id: createNodeId(`${parent} >>> Opengraph`),
      url,
      description: metadata.description,
      publisher: metadata.publisher,
      title: metadata.title,
      data: metadata.data,
      imageUrl: metadata.image,
      //expires: opengraphResponse.data.expires,
      parent,
      children: [],
      internal: {
        type: `Opengraph`,
      },
      image___NODE: fileNode.id,
    }

    opengraphNode.internal.contentDigest = createContentDigest(opengraphNode)

    createNode(opengraphNode)

    return opengraphNode
  } catch (e) {
    console.log(`Failed to opengraph ${url} due to ${e}. Retrying...`)

    throw e
  }
}
