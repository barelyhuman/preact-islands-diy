import preactRenderToString from 'preact-render-to-string'
import HomePage from '../pages/HomePage.js'
import { h } from 'preact'
import { extractCss, setup } from 'goober'
import { withManifestBundles } from '../lib/html.js'

setup(h)

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', async (req, res) => {
  const body = preactRenderToString(h(HomePage, {}))
  const styles = extractCss()
  res.send(
    withManifestBundles({
      styles,
      body,
    })
  )
})

app.use('/public', express.static('./dist', { maxAge: 60 * 60 * 1000 }))

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
