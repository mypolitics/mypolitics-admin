'use strict';
const moment = require("moment");

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(str, newStr){
    if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
      return this.replace(str, newStr);
    }
    return this.replace(new RegExp(str, 'g'), newStr);
  };
}

const toRegionalLetter = (l) => String.fromCodePoint(parseInt("1F1E6", 16) + l.charCodeAt(0) - 97);
const toEmoji = (country) => [...country].map(toRegionalLetter).join('');
const applicableOrNull = (v) => !!v && v !== "NOT_APPLICABLE" ? v : null;

const quarterEmoji = {
  'red': '🔴',
  'blue': '🔵',
  'violet': '🟣',
  'green': '🟢',
  'center': '⚪️',
};

const buildDescription = async (data, { twitter = false }) => {
  const organisations = await strapi.query('organisation').find({
    id_in: data.party_percent.map(({ organisation }) => organisation)
  });

  const orgsData = data.party_percent
    .map((p) => {
      const org = organisations.find(({ id }) => id === p.organisation);
      const epFractionFormat = (f) => (
        !!f ? f.replaceAll("_and_", "&").replaceAll("_", " ") : null
      );

      const additionalInfoArr = [
        applicableOrNull(quarterEmoji[org?.quarter]),
        epFractionFormat(applicableOrNull(org?.ep_fraction)),
      ].filter((i) => !!i);

      const additionalInfo = ` [${additionalInfoArr.join(", ")}]`;
      const additionalInfoStr = additionalInfoArr.length > 0 ? additionalInfo : '';
      const orgName = strapi.services.organisation.formatName(org, { twitter, shortname: true });

      return `${orgName} ${p.value}%${additionalInfoStr}`
    })
    .join("\n");

  const startDate = moment(data.fieldwork_start).format("DD.MM");
  const endDate = moment(data.fieldwork_end).format("DD.MM.YYYY");

  const additionalData = [
    `${data.polling_firm.replaceAll("_", " ")}${data.commissioner ? ` dla ${data.commissioner}` : ''}`,
    applicableOrNull(data?.method),
    data?.sample ? `N=${data.sample}` : '',
    [startDate, endDate].join("-"),
    data?.source ? data.source : ''
  ];
  const chips = additionalData.filter(d => !!d);
  data.chips = chips.join(";");

  const paragraphs = [
    `${toEmoji(data.country)} ${data.title}`,
    `📊 ${chips.join(" | ")}`,
    orgsData
  ];

  return paragraphs.join(`\n\n`);
};

module.exports = {
  buildDescription,
};
