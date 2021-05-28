if (!String.prototype.replaceAll) {
	String.prototype.replaceAll = function(str, newStr) {
		if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
			return this.replace(str, newStr);
		}

		return this.replace(new RegExp(str, 'g'), newStr);
	};
}

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
    "fidesz-kdnp": "6093a97fbe041d0012d8bb49",
    "dk": "6093abc0be041d0012d8bb55",
    "jobbik": "6093aab6be041d0012d8bb4f",
    "mszp": "6093ab57be041d0012d8bb52",
    "momentum": "6089cdaf96d5670012c427cb",
    "dk|mszp|m|lmp|p|jobbik": "60ad48848dbfad001376eb99",
    "dk/mszp/m/lmp/p/jobbik": "60ad48848dbfad001376eb99",
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
const valuesRegex = /(?:^|\()(\S+)[-~→].+\)?: (\d{1,4})(?:%|$|\S)/gm;
const fieldworkRegex = /^Field\s?work: (?:(.+)\s?[,–-]\s?)?(.+)$/gm;
const sampleSizeRegex = /^Sample size: ([\d,]+)/gm;
const matchAllValues = (str, regex) => [...str.matchAll(regex)];
const toCorrectDate = date => {
  date = date.replaceAll("/", "-").split("-");

  const months = {
    "01": "january",
    "02": "february",
    "03": "march",
    "04": "april",
    "05": "may",
    "06": "june",
    "07": "july",
    "08": "august",
    "09": "september",
    "10": "october",
    "11": "november",
    "12": "december",
  }

  Object.keys(months).forEach(key => {
    date[1] = date[1].replace(key, months[key])
  })

  return date.join("-");
};

const getStartEnd = (text) => {
  let [, start, end] = (matchAllValues(text, fieldworkRegex)[0]).map(toCorrectDate);
  end = new Date(Date.parse(end));

  if (!start) {
    start = end;
  } else {
    let [day, month, year] = start.split("-");
    month = month ? month : end.getMonth();
    year = year ? year : end.getFullYear();
    start = new Date([day, month, year].join("-"));
  }

  return {
    start,
    end
  }
}

const getPartyPercent = (text, countryCode) => {
  const otherParty = partiesIds[countryCode].other;
  const partiesValues = matchAllValues(text, valuesRegex);
  const allParties = partiesValues.map(([, shortname, value]) => {
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
  const [, sample] = matchAllValues(text, sampleSizeRegex)[0];
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
    console.error(e)
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
