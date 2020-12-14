'use strict';

const slugify = require('slugify');

module.exports = {
  lifecycles: {
    beforeCreate: async (data) => {
      if (data.politician.name) {
        data.slug = slugify(data.politician.name).toLowerCase();
      }
    },
    beforeUpdate: async (params, data) => {
      if (data.politician.name) {
        data.slug = slugify(data.politician.name).toLowerCase();
      }
    },
  },
};
