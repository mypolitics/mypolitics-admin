const axios = require("axios");
const HTMLParser = require('node-html-parser');

const postsIds = [];

const Country = {
  Germany: "de",
  Hungary: "hu",
  France: "fr",
};

const partiesIds = {
  [Country.Germany]: {
    "cdu/csu": "607454b7d58a790d2c5df350",
    spd: "607455d3d58a790d2c5df357",
    "afd": "60745616d58a790d2c5df35a",
    fdp: "607456e7d58a790d2c5df360",
    "linke": "607456acd58a790d2c5df35d",
    "grüne": "6074556bd58a790d2c5df353",
    other: "606b7ab02583834ef83945dc",
  },
  [Country.Hungary]: {
    "fidesz": "6093a97fbe041d0012d8bb49",
    "dk": "6093abc0be041d0012d8bb55",
    "jobbik": "6093aab6be041d0012d8bb4f",
    "mszp": "6093ab57be041d0012d8bb52",
    "momentum": "6089cdaf96d5670012c427cb",
    other: "606b7ab02583834ef83945dc",
  },
  [Country.France]: {
    "rn": "60923cfebe041d0012d8baeb",
    "lrem": "60923742be041d0012d8baca",
    "fi": "60923a6cbe041d0012d8bad9",
    "lr": "60924351be041d0012d8bb0f",
    other: "606b7ab02583834ef83945dc",
  },
};

const titleRegex = new RegExp(`^(${Object.keys(Country).join("|")}),\\s+(.+)\\s+poll:`, 'gm')
const valuesRegex = /(?:^|\()(\S+)[-~→].+\)?: (\d{1,4})(?:%|$)/gm;
const fieldworkRegex = /^Fieldwork: (?:(.+)\s?-\s?)?(.+)$/gm;
const sampleSizeRegex = /^Sample size: ([\d,]+)/gm;
const matchAllValues = (str, regex) => [...str.matchAll(regex)];

const getStartEnd = (text) => {
  let [, start, end] = matchAllValues(text, fieldworkRegex)[0];
  end = new Date(Date.parse(end));

  if (!start) {
    start = end;
  } else {
    let [day, month, year] = start.split(" ");
    month = month ? month : end.getMonth();
    year = year ? year : end.getFullYear();
    start = new Date([year, month, day].join("-"));
  }

  return {
    start,
    end
  }
}

const getPartyPercent = (text, countryCode) => {
  const otherParty = partiesIds[countryCode].other;
  const partiesValues = matchAllValues(text, valuesRegex);
  const allParties = partiesValues.map(([_, shortname, value]) => {
    const organisation = partiesIds[countryCode]?.[shortname.toLowerCase()];
    return { value, organisation };
  });

  const partiesWithOrg = allParties.filter(({ organisation }) => !!organisation);

  const partiesWithOrgSum = partiesWithOrg
    .reduce((prev, curr) => {
      const getVal = obj => parseFloat(obj.value);
      return prev + getVal(curr)
    }, 0);

  const otherParties = allParties
    .filter(({ organisation }) => !organisation)
    .reduce((prev, curr) => {
      const getVal = obj => parseFloat(obj.value);
      return {
        organisation: otherParty,
        value: getVal(prev) + getVal(curr)
      };
    }, { organisation: otherParty, value: 100 - partiesWithOrgSum });
  
  return allParties
    .filter(({ organisation }) => !!organisation)
    .concat(otherParties.value > 0 ? otherParties : [])
}

const parsePost = (text) => {
  const [, country, pollComm] = matchAllValues(text, titleRegex)[0];
  const [polling_firm, commissioner] = pollComm.split(" for ");
  const [_, sample] = matchAllValues(text, sampleSizeRegex)[0];
  const { start, end } = getStartEnd(text);
  const countryCode = Country[country];
  const party_percent = getPartyPercent(text, countryCode);

  return {
    title: `#Sondaż`,
    sample: parseInt(sample.replace(",", ""), 10),
    country: countryCode,
    party_percent,
    polling_firm,
    commissioner,
    fieldwork_start: start,
    fieldwork_end: end,
    scope: "national",
    source: "EuropeElects",
  };
};

const postToPollOrNull = text => {
  try {
    return parsePost(text);
  } catch (e) {
    return null;
  }
};

module.exports = (strapi) => {
  return {
    async initialize() {
      strapi.services.europeelects = {
        parsePost,
        postToPollOrNull,
      };
    },
  };
};
