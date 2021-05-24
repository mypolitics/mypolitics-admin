'use strict';

const formatName = (data, { twitter = false, orgShortName = false }) => {
  const formatOrgName = strapi.services.organisation.formatName;
  const org = typeof data.organisation !== "undefined" ? ` [${formatOrgName(data.organisation, { twitter, shortName: orgShortName })}]` : '';
  const name = twitter && data.twitter ? `@${data.twitter}` : data.name;

  return `${name}${org}`;
};

module.exports = {
   formatName
};
