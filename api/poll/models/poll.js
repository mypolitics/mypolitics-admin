'use strict';

const btoa = function (str) {
  return new Buffer.from(str, 'binary').toString('base64');
};

const hexToRGB = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
};

const onChange = async (data) => {
  if (!data.party_percent) {
    return;
  }

  data.party_percent = data.party_percent.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))

  const HEIGHT_BASE = 314;
  const maxValue = Math.max(...data.party_percent.map(({ value }) => parseInt(value, 10)));
  const API_URL = process.env.NODE_ENV !== "production" ? 'http://localhost:1337/' : 'https://admin.mypolitics.pl/';
  const organisations = await strapi.query('organisation').find({
    id_in: data.party_percent.map(({ organisation }) => organisation)
  });

  data.description = await strapi.services.poll.buildDescription(data, { twitter: false });
  data.description_twitter = await strapi.services.poll.buildDescription(data, { twitter: true });

  const params = {
    template: 'poll',
    data: {
      chips: data.chips.split(";"),
      title: data.title,
      country: `${API_URL}flags/${data.country}.png`,
      parties: data.party_percent
        .map((p) => {
        const org = organisations.find(({ id }) => id === p.organisation);
        const color = org.color || "#00B3DB";

        return {
          logo: org.logo.url,
          value: p.value,
          shadowColor: hexToRGB(color, 0.3),
          height: (parseInt(p.value, 10)/maxValue) * HEIGHT_BASE,
          color,
        }
      })
    }
  };

  params.data = btoa(unescape(encodeURIComponent(
    JSON.stringify(params.data)
  )));

  const { image, buffer } = await strapi.services.getImage(params);
  data.image = image;
};

module.exports = {
  lifecycles: {
    beforeCreate: onChange,
    beforeUpdate: async (_, data) => {
      await onChange(data);
    },
  },
};
