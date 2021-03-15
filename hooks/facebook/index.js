const FB = require('fb');
FB.setAccessToken(strapi.config.get('hook.settings.facebook').accessToken);

const post = async ({
  message,
  scheduledPublishTime = undefined,
  link = undefined,
  mediaUrl = undefined
}) => {
  const endpoint = !!link ? 'feed' : 'photos';
  const textKey = !!link ? 'message' : 'caption';

  const params = {
    [textKey]: message,
    published: !scheduledPublishTime,
    scheduled_publish_time: scheduledPublishTime,
    url: mediaUrl,
    link,
  };

  console.log('FACEBOOK: Post start');
  return FB.api(`myPoliticsTest/${endpoint}`, 'post', params);
};

module.exports = strapi => {
  return {
    async initialize() {
      strapi.services.facebook = {
        post,
      }
    },
  };
};
