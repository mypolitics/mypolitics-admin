'use strict';

const axios = require('axios');

/*const brands = {
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
  Cookie: `jwt=${process.env.STREAMYARD_JWT}`,
};

const buildTitle = (data) => {

  const config = {
    'mvsp': `MŁODZIEŻ VS ${data.title.toUpperCase()}`,
    'classic': `${data.title} | DEBATA MŁODZIEŻÓWEK`,
    'interview': `${data.title} o sytuacji w Polsce! | WYWIAD`,
    'expert': `${data.title} | OKIEM EKSPERTA`,
    'ring': `${data.title} | RING POLITYCZNY`,
  }

  return config[data.type];
}

const createBroadcast = async (data) => {
  return await axios.request({
    url: "https://streamyard.com/api/broadcasts",
    data: {
      title: buildTitle(data),
      recordOnly: false,
      selectedBrandId: brands[data.type],
      csrfToken: "46Tc0fhhdD7B49nWurLlz8M0"
    },
    method: 'POST',
    headers,
    withCredentials: true,
  });
};

const createOutput = async (data, id, outputType) => {
  const formData = new FormData();

  formData.append('title', buildTitle(data));
  formData.append('description', '');
  formData.append('destinationId', destinations[outputType]);

  if (outputType === 'youtube') {
    formData.append('image', data.thumbnail);
    formData.append('plannedStartTime', data.start);
  }

  return await axios.request({
    url: `https://streamyard.com/api/broadcasts/${id}/outputs`,
    data: formData,
    method: 'POST',
    headers,
    withCredentials: true,
  })
}*/

module.exports = {
};
