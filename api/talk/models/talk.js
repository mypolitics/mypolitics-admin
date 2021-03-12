'use strict';

const onChange = async (data, { hard = false }) => {
  const politicians = await strapi.query('politician').find({
    id_in: data.politicians
  }, ['organisation']);

  if (data.politicians.length === 1 && data.type !== "expert") {
    const { name } = politicians[0];
    const inOrg = typeof politicians[0].organisation !== "undefined";
    const postamble = inOrg ? ` [${politicians[0].organisation.shortname}]` : '';

    data.title = `${name}${postamble}`;
  }

  if (data.politicians.length === 2) {
    const getLastNameAndOrg = (index) => {
      const { name, organisation: { shortname: orgName } } = politicians[index];
      const [_, lastName] = name.split(' ');
      return `${lastName.toUpperCase()} [${orgName}]`;
    };

    data.title = `${getLastNameAndOrg(0)} VS ${getLastNameAndOrg(1)}`;
  }

  const { image, buffer } = await strapi.services.images(data);
  data.thumbnail = image;
  console.log('TALK: Image initialized');

  if (!hard) {
    return;
  }

  await strapi.services.streamyard(data, buffer);
  console.log('TALK: Streamyard initialized');

  const socialDescriptionNow = await strapi.services.talk.buildDescription(data, {
    withPostamble: false,
    inFuture: true,
    withUrl: true
  });

  const socialDescriptionFuture = await strapi.services.talk.buildDescription(data, {
    withPostamble: false,
    inFuture: false,
    withUrl: true
  });

  if (!data.tt_post_id) {
    const nowTime = (new Date()).getTime() + 5 * 60 * 1000;
    const startTime = (new Date(data.start)).getTime();

    const { data: nowPost } = await strapi.services.twitter.post({
      status: socialDescriptionNow,
      executeAt: nowTime,
      medias: [buffer]
    });

    const { data: startPost } = await strapi.services.twitter.post({
      status: socialDescriptionFuture,
      executeAt: startTime,
      medias: [buffer]
    });

    data.tt_post_id = `${nowPost},${startPost}`;
  }
  console.log('TALK: Twitter initialized');

  if (!data.fb_post_id) {
    const startTime = Math.round((new Date(data.start)).getTime() / 1000);

    const nowPost = await strapi.services.facebook.post({
      message: socialDescriptionNow,
      mediaUrl: image.url,
    });

    const startPost = await strapi.services.facebook.post({
      message: socialDescriptionFuture,
      scheduledPublishTime: startTime,
      mediaUrl: image.url,
    });

    data.fb_post_id = `${nowPost.post_id},${startPost.id}`;
  }
  console.log('TALK: Facebook initialized');
};

module.exports = {
  lifecycles: {
    beforeUpdate: async (_, data) => {
      if (data.lang !== "pl") {
        return;
      }

      const moreData = await strapi.query('talk').findOne({
        id: data._id
      });

      const hard = moreData && moreData.published_at !== null;
      await onChange(data, { hard });
    },
  },
};
