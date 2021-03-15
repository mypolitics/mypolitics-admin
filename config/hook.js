module.exports = {
  settings: {
    images: {
      enabled: true,
    },
    streamyard: {
      enabled: true,
      jwt: process.env.STREAMYARD_JWT,
      csrf: process.env.STREAMYARD_CSRF,
    },
    twitter: {
      enabled: true,
      jwt: process.env.TWITTER_JWT,
      csrf: process.env.TWITTER_CSRF,
      cookie: process.env.TWITTER_COOKIE,
    },
    facebook: {
      enabled: true,
      accessToken: process.env.FACEBOOK_TOKEN,
    },
  },
};
