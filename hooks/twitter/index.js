const axios = require('axios');
const _ = require('lodash');
const FormData = require('form-data');

const headers = {
  'pragma':`no-cache`,
  'cache-control':`no-cache`,
  'sec-ch-ua':`"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"`,
  'x-csrf-token': strapi.config.get('hook.settings.twitter').csrf,
  'sec-ch-ua-mobile':`?0`,
  'authorization':strapi.config.get('hook.settings.twitter').jwt,
  'accept':`text/plain, */*; q=0.01`,
  'user-agent':`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36`,
  'x-twitter-auth-type':`OAuth2Session`,
  'x-twitter-client-version':`Twitter-TweetDeck-blackbird-chrome/4.0.200604103812 web/`,
  'origin':`https://tweetdeck.twitter.com`,
  'sec-fetch-site':`same-site`,
  'sec-fetch-mode':`cors`,
  'sec-fetch-dest':`empty`,
  'x-act-as-user-id': '1325495452935090177',
  'referer':`https://tweetdeck.twitter.com/`,
  'accept-language':`en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7,be;q=0.6`,
  'cookie': strapi.config.get('hook.settings.twitter').cookie
};

const post = async ({ status, executeAt, medias = [] }) => {
  const mediaIdsPromise = medias.map(async (media) => await uploadMedia(media));
  const mediaIds = await Promise.all(mediaIdsPromise);

  const data = [
    null,
    { "tweetCreateRequest": {
        "postTweetRequest":{
          "status": `${status}`,
          "createdVia":"myPolitics",
          "mediaIds": mediaIds
        },
      },
      "executeAt": executeAt.toString().slice(0, -3),
    }
  ];

  console.log('TWITTER: Post start');
  return await axios.post(
    `https://api.twitter.com/1.1/strato/op/insert/schedule/insert`,
    data,
    {
    method: 'POST',
    withCredentials: true,
    headers: headers,
  }).catch((e) => console.log(e))
};

const uploadMedia = async (binary) => {
  const init = await axios.post(
    `https://upload.twitter.com/1.1/media/upload.json?command=INIT&total_bytes=${binary.length}&media_type=image%2Fpng`,
    null,
    {
      method: 'POST',
      withCredentials: true,
      headers,
    });
  const mediaId = init.data.media_id_string;
  console.log('TWITTER: Media init', mediaId);

  const formData = new FormData();
  formData.append('media', binary, 'blob');

  await axios.post(
    `https://upload.twitter.com/1.1/media/upload.json`,
    formData,
    {
      params: {
        command: 'APPEND',
        media_id: mediaId,
        segment_index: 0,
      },
      method: 'POST',
      withCredentials: true,
      headers: {
        ...headers,
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
      },
    });
  console.log('TWITTER: Media append');

  await axios.post(
    `https://upload.twitter.com/1.1/media/upload.json?command=FINALIZE&media_id=${mediaId}`,
    null,
    {
      method: 'POST',
      withCredentials: true,
      headers,
    });
  console.log('TWITTER: Media finish');

  return mediaId;
}

module.exports = strapi => {
  return {
    async initialize() {
      strapi.services.twitter = {
        post,
      }
    },
  };
};
