'use strict';

const onChange = async (data) => {
  const formatName = strapi.services.politician.formatName;
  if (!data.type) {
    return;
  }

  const politicians = await strapi.query('politician').find({
    id_in: data.politicians
  }, ['organisation']);

  if (data.politicians.length === 1 && data.type !== "expert") {
    data.title = formatName(politicians[0], { orgShortName: true });
  }

  if (data.politicians.length === 2) {
    const getLastNameAndOrg = (index) => {
      const { name } = politicians[index];
      const inOrg = typeof politicians[index].organisation?.shortname !== "undefined";
      const postamble = inOrg ? ` [${politicians[index].organisation.shortname}]` : '';
      const [_, lastName] = name.split(' ');
      return `${lastName.toUpperCase()}${postamble}`;
    };

    data.title = `${getLastNameAndOrg(0)} VS ${getLastNameAndOrg(1)}`;
  }

  let buffer = undefined;

  if (!data.thumbnail) {
    const { image, ...td } = await strapi.services.getTalkImage(data);
    buffer = td.buffer;
    data.thumbnail = image;
  }

  if (!data.streamyard_id) {
    await strapi.services.streamyard(data, buffer);
  }

  const descOptions = {
    withPostamble: false,
    inFuture: false,
    withUrl: true
  };

  data.description = await strapi.services.talk.buildDescription(data, descOptions);
  data.description_twitter = await strapi.services.talk.buildDescription(data, { ...descOptions, twitter: true });
  data.description_future = await strapi.services.talk.buildDescription(data, { ...descOptions, inFuture: true });
  data.description_future_twitter = await strapi.services.talk.buildDescription(data, { ...descOptions, inFuture: true, twitter: true });
};

module.exports = {
  lifecycles: {
    beforeCreate: onChange,
    beforeUpdate: async (_, data) => {
      if (data.lang !== "pl") {
        return;
      }

      await onChange(data);
    },
  },
};
