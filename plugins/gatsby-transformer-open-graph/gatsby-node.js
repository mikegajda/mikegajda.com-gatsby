const crypto = require(`crypto`)

const axios = require(`axios`)

const Queue = require(`better-queue`)

const { createRemoteFileNode } = require(`gatsby-source-filesystem`) //const SCREENSHOT_ENDPOINT = `https://h7iqvn4842.execute-api.us-east-2.amazonaws.com/prod/screenshot`

const LAMBDA_CONCURRENCY_LIMIT = 50
const openGraphQueue = new Queue(
  (input, cb) => {
    createOpenGraphNode(input)
      .then(r => cb(null, r))
      .catch(e => cb(e))
  },
  {
    concurrent: LAMBDA_CONCURRENCY_LIMIT,
    maxRetries: 10,
    retryDelay: 1000,
  }
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
  const { createNode, touchNode } = actions // getNodes().map((node) => {
  //   console.log("here", node.frontmatter)
  // })

  const openGraphNodes = getNodes().filter(
    n =>
      n.internal &&
      n.internal.type === `MarkdownRemark` &&
      n.frontmatter &&
      n.frontmatter.link
  )
  console.log('openGraphNodes=', openGraphNodes.length)

  if (openGraphNodes.length === 0) {
    return null
  }

  let anyQueued = false // Check for updated screenshots
  // and prevent Gatsby from garbage collecting remote file nodes

  openGraphNodes.forEach(n => {
    openGraphQueue.push({
      url: n.frontmatter.link,
      parent: n.parent,
      store,
      cache,
      createNode,
      createNodeId,
    }) // if (n.expires && new Date() >= new Date(n.expires)) {
    //   anyQueued = true
    //   // Screenshot expired, re-run Lambda
    // } else {
    //   // Screenshot hasn't yet expired, touch the image node
    //   // to prevent garbage collection
    //   touchNode({ nodeId: n.screenshotFile___NODE })
    // }
  })

  if (!anyQueued) {
    return null
  }

  return new Promise((resolve, reject) => {
    openGraphQueue.on(`drain`, () => {
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
  console.log('create node in plugin', node) // We only care about parsed sites.yaml files with a url field

  if (!node.link) {
    console.log('no link found')
    return
  }

  const openGraphNode = await new Promise((resolve, reject) => {
    openGraphQueue
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
    child: openGraphNode,
  })
}

const createOpenGraphNode = async ({
  url,
  parent,
  store,
  cache,
  createNode,
  createNodeId,
}) => {
  try {
    const openGraphResponse = {
      og: {
        ogUrl:
          'https://cdn.vox-cdn.com/thumbor/oQHsce6Ez49l4rdP4QbHa-PIetE=/0x0:2040x1360/1220x813/filters:focal(857x517:1183x843):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/61115509/acastro_180416_1777_chrome_0001.0.jpg',
      }, //await axios.post(SCREENSHOT_ENDPOINT, { url })
    }
    console.log('createOpenGraphNode', url, openGraphResponse.og.ogUrl)
    const fileNode = await createRemoteFileNode({
      url: openGraphResponse.og.ogUrl,
      store,
      cache,
      createNode,
      createNodeId,
    })

    if (!fileNode) {
      throw new Error(`Remote file node is null`, openGraphResponse.og.ogUrl)
    }

    const openGraphNode = {
      id: createNodeId(`${parent} >>> OpenGraph`),
      url,
      // expires: screenshotResponse.data.expires,
      parent,
      children: [],
      internal: {
        type: `OpenGraph`,
      },
      openGraphFile___NODE: fileNode.id,
    }
    openGraphNode.internal.contentDigest = createContentDigest(openGraphNode)
    createNode(openGraphNode)
    return openGraphNode
  } catch (e) {
    console.log(`Failed to ${url}. Retrying...`)
    throw e
  }
} //exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`)
