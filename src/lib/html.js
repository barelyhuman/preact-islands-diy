export const withManifestBundles = ({ styles, body }) => {
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

    <script defer>
      fetch("/public/js/manifest.json")
      .then(res=>res.json())
      .then(data=>{
        Object.keys(data).forEach(key=>{
          const elm =document.createElement("script");
          elm.src=\`/public/js/\${data[key]}\`
          document.body.append(elm);
        })
      })
    </script>

  </html>`
}
