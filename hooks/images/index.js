const _ = require("lodash");
const nodeHtmlToImage = require("node-html-to-image");
const { optimize } = strapi.plugins.upload.services["image-manipulation"];

const getImage = async ({ templateName, content }) => {
  const template = (await import(`./templates/${templateName}.js`)).default;
  const chromeExecutablePath = process.env.CHROME_EXECUTABLE_PATH;
  
  const sizes = {
    poll: () => {
      const columnWidth = content.longNames ? 160 : 96;
      const margin = 16;
      const width = content.columns.length * (columnWidth + margin) + 256;
      return [Math.max(width, 1056), 1056];
    },
    square: () => [900, 900],
    default: () => [900, 500],
  };

  const [width, height] = (sizes[templateName] || sizes.default)();

  const imageData = await nodeHtmlToImage({
    content,
    puppeteerArgs: {
      args: ["--no-sandbox"],
      executablePath: chromeExecutablePath,
    },
    html: `
      <html>
        <head>
          <style>
            body {
              width: ${width}px;
              height: ${height}px;
            }
          </style>
          <link rel="preconnect" href="https://fonts.gstatic.com">
          <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;700&display=swap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;700&display=swap" rel="stylesheet">
        </head>
        <body>
          ${template}
        </body>
      </html>
    `,
  });

  const { buffer, info } = await optimize(imageData);

  const formattedFile = strapi.plugins["upload"].services.upload.formatFileInfo(
    {
      filename: "blob.png",
      type: "image/png",
      size: imageData.size,
    }
  );

  const file = _.assign(formattedFile, info, {
    buffer,
  });

  return {
    buffer,
    image: await strapi.plugins["upload"].services.upload.uploadFileAndPersist(
      file
    ),
  };
};

module.exports = (strapi) => {
  return {
    async initialize() {
      strapi.services.getImage = getImage;
    },
  };
};
