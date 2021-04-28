const axios = require('axios');
const FormData = require('form-data');

const urlType = {
  "elections": strapi.config.get('hook.settings.discord').elections,
};

const post = async ({ content, type, file = undefined }) => {
  const formData = new FormData();
  formData.append('content', content);

  if (file) {
    formData.append('media', file, 'blob');
  }

  await axios.post(urlType[type], formData, {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
    },
  });
};

module.exports = strapi => {
  return {
    async initialize() {
      strapi.services.discord = {
        post,
      }
    },
  };
};
