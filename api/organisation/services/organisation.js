'use strict';

const formatName = (data, { twitter = false, shortname = false }) => (
  twitter && data.twitter ? `@${data.twitter}` : data[shortname ? 'shortname' : 'name']
)

module.exports = {
  formatName
};
