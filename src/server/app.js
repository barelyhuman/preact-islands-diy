import { extractCss, setup } from 'goober'
import { h } from 'preact'
import preactRenderToString from 'preact-render-to-string'
import { withManifestBundles } from '../lib/html.js'
import HomePage from '../pages/HomePage.js'

setup(h)

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', async (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.status(200).write(
    withManifestBundles({
      body: preactRenderToString(<HomePage />),
      styles: extractCss(),
    })
  )
  res.end()
})

app.use('/public', express.static('./dist', { maxAge: 60 * 60 * 1000 }))

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
