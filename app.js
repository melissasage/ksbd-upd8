const Parser = require('rss-parser')
const https = require('https')
const querystring = require('querystring')
require('dotenv').config()

const parser = new Parser()

const mastodonPost = status => { 
  const postData = querystring.stringify({ 
    status, 
    visibility: 'unlisted'
  })

  const options = {
    hostname: "botsin.space",
    path: "/api/v1/statuses/",
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MASTODON_AUTH}`,
    }
  }

  const req = https.request(options, res => {
    res.setEncoding('utf8')
    res.on('data', c => console.log(c.toString()))
  })
  
  req.write(postData)
  req.on('error', e => console.error(e))
  req.end()
}

const compose = (i) => `KILL SIX BILLION DEMONS upd8: ${i.title}\n\n${i.contentSnippet}\n\n${i.link}`

const main = async (intervalInMins) => {
  const ksbd = await parser.parseURL('https://killsixbilliondemons.com/feed/')
  const interval = intervalInMins * 1000 * 60
  const latest = ksbd.items[0] // multi-page updates only show up as one item, so there's no need to traverse the feed.
  const now = new Date()
  const published = new Date(latest.pubDate)

  if (now - published <= interval) mastodonPost(compose(latest))
}

main(15)