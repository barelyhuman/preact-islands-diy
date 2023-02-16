export const withManifestBundles = ({ styles, body }) => {
  return `<html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        html {
          font-family: sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      </style>
      <style id="_goober">
        ${styles}
      </style>
    </head>

    <body>
      ${body}
    </body>
    <script
      type="application/javascript"
      src="/public/js/client.js"
      defer
    ></script>
  </html>`
}
