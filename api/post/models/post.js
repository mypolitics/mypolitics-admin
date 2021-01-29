'use strict';
const slugify = require('slugify');

const slugTitle = (title) => {
  const translationsSlug = Object.keys(title).map(
    (key) => [key, slugify(title[key]).toLowerCase()],
  );
  return Object.fromEntries(translationsSlug);
};

const getSlugs = (data) => {
  const withoutSlugOrEmpty = (k) => (
    !['__v', ...Object.keys(data.slug)].includes(k) || data.slug[k] === ''
  );
  const toEntries = (k) => [k, data.title[k]];
  const titleEntries = Object.keys(data.title).filter(withoutSlugOrEmpty).map(toEntries);
  const title = Object.fromEntries(titleEntries);
  return slugTitle(title);
};

const getDefaultTitle = (data) => {
  const withoutId = (k) => !['__v', 'id', '_id'].includes(k);
  const withoutEmpty = (k) => data.title[k] !== "";
  const toValues = (k) => data.title[k];
  const notEmptyTitles = Object
    .keys(data.title)
    .filter(withoutId)
    .filter(withoutEmpty)
    .map(toValues);
  return notEmptyTitles[0] !== undefined ? notEmptyTitles[0] : "";
};

const onChange = (data) => {
  data.slug = {
    ...data.slug,
    ...getSlugs(data)
  };

  data.default_title = getDefaultTitle(data);
};

module.exports = {
  lifecycles: {
    beforeCreate: onChange,
    beforeUpdate: (_, data) => data.title && onChange(data),
  },
};
