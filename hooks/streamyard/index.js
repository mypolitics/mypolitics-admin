const axios = require('axios');
const _ = require('lodash');
const FormData = require('form-data');

const buildTitle = (data) => {
  const preambule = process.env.NODE_ENV === "development" ? `[TEST SYSTEMU] ` : '';

  const config = {
    'mvsp': `MŁODZIEŻ VS ${data.title.toUpperCase()}`,
    'classic': `${data.title} | DEBATA MŁODZIEŻÓWEK`,
    'interview': `${data.title} o sytuacji w Polsce! | WYWIAD`,
    'expert': `${data.title} | OKIEM EKSPERTA`,
    'ring': `${data.title} | RING POLITYCZNY`,
  };

  return `${preambule}${config[data.type]}`;
};

const brands = {
  'mvsp': '6376486378668032',
  'classic': '5990601388720128',
  'interview': '4976477451321344',
  'expert': '6570354065801216',
  'ring': '6040516632510464'
};

const destinations = {
  'facebook': '5451405091667968',
  'youtube': '5768594248171520'
};

const headers = {
  'accept': `*/*`,
  'referer': `https://streamyard.com/broadcasts`,
  'sec-ch-ua':`"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"`,
  'sec-ch-ua-mobile': `?0`,
  'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36`,
  'Content-Type' : 'application/json',
  'Cookie': `jwt=${strapi.config.get('hook.settings.streamyard').jwt}; Max-Age=2764800; Expires=Mon, 05 Apr 2021 16:23:08 GMT; Secure; HttpOnly; Path=/;csrfToken=${strapi.config.get('hook.settings.streamyard').csrf}; Max-Age=2764800; Expires=Mon, 05 Apr 2021 16:23:08 GMT; Secure; Path=/`,
};

const createBroadcast = async (data) => {
  return await axios.post("https://streamyard.com/api/broadcasts", {
    title: buildTitle(data),
    recordOnly: true,
    selectedBrandId: brands[data.type],
    csrfToken: strapi.config.get('hook.settings.streamyard').csrf,
  }, {
    method: 'POST',
    withCredentials: true,
    headers,
  });
};

const createOutput = async ({ data, id, description, image, outputType }) => {
  const formData = new FormData();

  formData.append('title', buildTitle(data));
  formData.append('description', description);
  formData.append('privacy', 'public');
  formData.append('destinationId', destinations[outputType]);
  formData.append('csrfToken', strapi.config.get('hook.settings.streamyard').csrf);

  if (outputType === 'youtube') {
    formData.append('image', image, 'blob.png');
    formData.append('plannedStartTime', new Date(data.start).toUTCString());
  }

  return await axios.post(`https://streamyard.com/api/broadcasts/${id}/outputs`, formData, {
    method: 'POST',
    withCredentials: true,
    headers: {
      ...headers,
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
    },
  })
};

const init = async (data, image) => {
  if (data.streamyard_id) {
    return;
  }

  const { data: result } = await createBroadcast(data);
  data.streamyard_id = result.id;

  const description = await strapi.services.talk.buildDescription(data, {
    withPostamble: true,
    inFuture: false,
    withUrl: false
  });

  const outputData = {
    data,
    id: data.streamyard_id,
    description,
    image,
  };

  await createOutput({
    ...outputData,
    outputType: 'facebook'
  });

  const { data: outputResult } = await createOutput({
    ...outputData,
    outputType: 'youtube'
  });

  data.url = outputResult.output.platformLink;
};

module.exports = strapi => {
  return {
    async initialize() {
      strapi.services.streamyard = init
    },
  };
};
