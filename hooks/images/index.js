const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');

const btoa = function (str) {
  return new Buffer.from(str, 'binary').toString('base64');
};

const buildData = async (data) => {
  const politicians = await strapi.query('politician').find({
    id_in: data.politicians || [],
  }, ['organisation']);

  const organisations = await strapi.query('organisation').find({
    id_in: data.organisations || []
  });

  const date = moment(data.start).locale("pl").format('D.MM (dddd) HH:mm')

  return {
    'mvsp': async () => {
      const [firstName, lastName] = politicians[0].name.split(" ");

      return {
        template: 'mvsp',
        data: {
          firstName,
          lastName,
          date,
          imageSrc: politicians[0].image.url
        }
      }
    },
    'classic': async () => {
      return {
        template: 'dm',
        data: {
          topic: data.title,
          date,
          organisations: organisations.map(o => o.logo.url)
        }
      }
    },
    'interview': async () => {
      const names = politicians[0].name.split(" ");
      const [firstName, lastName] = names.length === 2 ? names : names.slice(1);

      return {
        template: 'interview',
        data: {
          firstName,
          lastName,
          date,
          imageSrc: politicians[0].image.url,
          partyName: politicians[0].organisation.name,
          partySrc: politicians[0].organisation.logo.url,
        }
      }
    },
    'expert': async () => {
      const names = politicians[0].name.split(" ");
      const [firstName, lastName] = names.length === 2 ? names : names.slice(1);

      return {
        template: 'oe',
        data: {
          firstName,
          lastName,
          date,
          imageSrc: politicians[0].image.url
        },
      }
    },
    'ring': async () => {
      const persons = politicians.map(async (p) => {
        const [firstName, lastName] = p.name.split(" ");
        const orgData = !!p?.organisation ? {
          partyName: p.organisation.name,
          partySrc: p.organisation.logo.url
        } : {};

        return {
          firstName,
          lastName,
          imageSrc: p.image.url,
          ...orgData
        }
      });

      return {
        template: 'rp',
        data: {
          persons: await Promise.all(persons),
        }
      }
    }
  }
};

const getImage = async (params) => {
  const BASE_URL = process.env.NODE_ENV !== "production"
    ? "http://localhost:5000"
    : "https://api-v3.mypolitics.pl";

  const req = await axios.get(`${BASE_URL}/utils/images`, {
    params,
    responseType: 'arraybuffer'
  });

  const { optimize } = strapi.plugins.upload.services['image-manipulation'];

  const { buffer, info } = await optimize(Buffer.from(req.data, 'binary'));

  const formattedFile = strapi.plugins['upload'].services.upload.formatFileInfo(
    {
      filename: 'talk.png',
      type: 'image/png',
      size: req.data.length,
    },
  );

  const file = _.assign(formattedFile, info, {
    buffer,
  });

  return {
    buffer,
    image: await strapi.plugins['upload'].services.upload.uploadFileAndPersist(file),
  }
};

const getTalkImage = async (data) => {
  const func = (await buildData(data))[data.type];
  const params = await func();
  params.data = btoa(unescape(encodeURIComponent(
    JSON.stringify(params.data)
  )));

  return getImage(params);
};

module.exports = strapi => {
  return {
    async initialize() {
      strapi.services.getTalkImage = getTalkImage
      strapi.services.getImage = getImage
    },
  };
};
