'use strict';

const slugify = require('slugify');

module.exports = {
  lifecycles: {
    beforeCreate: async (data) => {
      const politician = await strapi.query('politician').findOne({ id: data.politician });
      if (politician) {
        data.slug = slugify(politician.name).toLowerCase();
      }
    },
    beforeUpdate: async (params, data) => {
      const politician = await strapi.query('politician').findOne({ id: data.politician });
      if (politician) {
        data.slug = slugify(politician.name).toLowerCase();
      }
    },
  },
};
