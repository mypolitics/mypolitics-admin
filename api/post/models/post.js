'use strict';
const slugify = require('slugify');

const slugTitle = (title) => {
  const translationsSlug = Object.keys(title).map(
    (key) => [key, slugify(title[key]).toLowerCase()],
  );
  return Object.fromEntries(translationsSlug);
};

const onChange = (data) => {
  const withoutSlugOrEmpty = (k) => !['__v', ...Object.keys(data.slug)].includes(k) || data.slug[k] === '';
  const toEntries = (k) => [k, data.title[k]];
  const titleEntries = Object.keys(data.title).filter(withoutSlugOrEmpty).map(toEntries);
  const title = Object.fromEntries(titleEntries);
  data.slug = { ...data.slug, ...slugTitle(title) };
};

module.exports = {
  lifecycles: {
    beforeCreate: onChange,
    beforeUpdate: (_, data) => onChange(data),
  },
};
