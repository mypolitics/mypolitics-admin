'use strict';

const onChange = async (data) => {
  const politicians = await strapi.query('politician').find({
    id_in: data.politicians
  });

  if (data.politicians.length === 1 && data.type !== "expert") {
    data.title = politicians[0].name;
  }

  if (data.politicians.length === 2) {
    const getLastName = (index) => {
      const [_, lastName] = politicians[index].name.split(' ');
      return lastName;
    };

    data.title = `${getLastName(0)} VS ${getLastName(1)}`.toUpperCase();
  }

  const { image, buffer } = await strapi.services.images(data);
  data.thumbnail = image;
  console.log('TALK: Image initialized');

  await strapi.services.streamyard(data, buffer);
  console.log('TALK: Streamyard initialized');

  const socialDescription = await strapi.services.talk.buildDescription(data, {
    withPostamble: false,
    inFuture: false,
    withUrl: true
  });

  if (!data.tt_post_id) {
    const nowTime = (new Date()).getTime() + 60 * 1000;
    const startTime = (new Date(data.start)).getTime();

    const { data: nowPost } = await strapi.services.twitter.post({
      status: socialDescription,
      executeAt: nowTime,
      medias: [buffer]
    });

    const { data: startPost } = await strapi.services.twitter.post({
      status: socialDescription,
      executeAt: startTime,
      medias: [buffer]
    });

    data.tt_post_id = `${nowPost},${startPost}`;
  }
  console.log('TALK: Twitter initialized');

  if (!data.fb_post_id) {
    const startTime = Math.round((new Date(data.start)).getTime() / 1000);

    const nowPost = await strapi.services.facebook.post({
      message: socialDescription,
      mediaUrl: image.url,
    });

    const startPost = await strapi.services.facebook.post({
      message: socialDescription,
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

      if (moreData.published_at !== null) {
        await onChange(data);
      }
    },
  },
};
