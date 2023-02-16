import manifest from '../../dist/js/manifest.json'

export const withManifestBundles = ({ styles, body }) => {
  const bundledScripts = Object.keys(manifest).map(key => {
    const scriptPath = `/public/js/${manifest[key]}`
    return `<script src=${scriptPath}></script>`
  })

  return `<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style id="_goober">
        ${styles}
      </style>
    </head>

    <body>
      ${body}
    </body>
    ${bundledScripts.join('')}
  </html>`
}
