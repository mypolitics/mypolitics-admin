'use strict';
const axios = require('axios');

const onChange = async (data) => {
  const formatName = strapi.services.politician.formatName;
  if (!data.type) {
    return;
  }

  const politicians = await strapi.query('politician').find({
    id_in: data.politicians || []
  }, ['organisation']);

  if (politicians.length === 1) {
    const politicianRawName = politicians[0].name;

    const titles = {
      "expert": () => (data.title || "").includes(politicianRawName)
        ? data.title
        : `${politicianRawName} – ${data.title}`,
      "default": () => formatName(politicians[0], { orgShortName: true })
    }

    data.title = (titles[data.type] || titles.default)();
  }

  if (politicians.length === 2 && ["ring", "lo"].includes(data.type)) {
    const getLastNameAndOrg = (index) => {
      const { name } = politicians[index];
      const inOrg = typeof politicians[index].organisation?.shortname !== "undefined";
      const postamble = inOrg ? ` [${politicians[index].organisation.shortname}]` : '';
      const [_, lastName] = name.split(' ');
      return `${lastName.toUpperCase()}${postamble}`;
    };

    const separator = {
      "ring": "VS",
      "lo": "&"
    }[data.type];

    data.title = `${getLastNameAndOrg(0)} ${separator} ${getLastNameAndOrg(1)}`;
  }

  let buffer = undefined;

  if (!data.thumbnail) {
    const { template: templateName, data: content } = await strapi.services.talk.buildImageData(data);
    const { image, ...td } = await strapi.services.getImage({ templateName, content });
    buffer = td.buffer;
    data.thumbnail = image;
  } else {
    const { url: thumbnailUrl } = await strapi.query('plugins::upload.file').findOne({ _id: data.thumbnail });

    buffer = await axios
      .get(thumbnailUrl, {
        responseType: 'arraybuffer'
      })
      .then(r => Buffer.from(r.data, 'binary'))
  }

  if (data.streamyard_id) {
    await strapi.services.streamyard.update(data, buffer);
  } else {
    await strapi.services.streamyard.init(data, buffer);
  }

  const descOptions = {
    withPostamble: false,
    inFuture: false,
    withUrl: true
  };

  const typeOpts = [
    ['description', descOptions],
    ['description_twitter', { ...descOptions, twitter: true }],
    ['description_future', { ...descOptions, inFuture: true }],
    ['description_future_twitter', { ...descOptions, inFuture: true, twitter: true }],
  ];

  await Promise.all(
    typeOpts.map(async ([key, opts]) => {
      data[key] = await strapi.services.talk.buildDescription(data, opts);
    })
  );
};

module.exports = {
  lifecycles: {
    beforeCreate: onChange,
    beforeUpdate: async (_, data) => {
      if (Object.keys(data).toString() === "published_at") {
        const dataObj = await strapi.query('talk').find({
          id: _._id
        }, ['thumbnail']);

        data = {
          ...dataObj[0],
          ...data
        }
      }

      await onChange(data);
    },
  },
};
