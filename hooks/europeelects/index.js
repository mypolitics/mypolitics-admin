const axios = require('axios');

const countries = {
  'de-N': 0.2,
  'pl-N': 1,
};

const getRandomCountry = () => {
  const rand = Math.random();
  return Object.entries(countries).find(([_, w]) => rand < w)[0]
};

const partiesIds = {
  "de": {
    "Union": "607454b7d58a790d2c5df350",
    "SPD": "607455d3d58a790d2c5df357",
    "Alternative für Deutschland": "60745616d58a790d2c5df35a",
    "FDP": "607456e7d58a790d2c5df360",
    "DIE LINKE": "607456acd58a790d2c5df35d",
    "BÜNDNIS 90/DIE GRÜNEN": "6074556bd58a790d2c5df353",
    "Other": "606b7ab02583834ef83945dc"
  },
  "pl": {
    "Prawo i Sprawiedliwość": "60402ed2e1eb1925a49ac947",
    "Platforma Obywatelska": "604031bae1eb1925a49ac94e",
    "Kukiz’15": "60403233e1eb1925a49ac959",
    ".Nowoczesna": "60402e9ce1eb1925a49ac943",
    "Polskie Stronnictwo Ludowe": "60403245e1eb1925a49ac95b",
    "KORWiN": "6040328be1eb1925a49ac961",
    "Lewica Razem": "60402eb4e1eb1925a49ac945",
    "Zjednoczona Prawica": "606def3cb30af31b24251de0",
    "Koalicja Obywatelska": "606c7d99ea820531f0a52642",
    "Lewica": "60403171e1eb1925a49ac949",
    "Koalicja Polska": "60403245e1eb1925a49ac95b",
    "Konfederacja": "606c7dcbea820531f0a52645",
    "Polska 2050": "606c7d7cea820531f0a5263f",
    "Other": "606b7ab02583834ef83945dc",
  }
}

const mapRowToModel = ({ row, topRow, country }) => {
  const [polling_firm, commissioner, fieldwork_start, fieldwork_end, scope, sample] = row;
  const countryMain = country.split("-")[0];

  const party_percent = topRow.map((key, index) => {
    const organisation = partiesIds[countryMain]?.[key];
    const value = row[index].slice(0, -1).replace(".", ",");
    const available = row[index] !== "Not Available";
    return organisation && available ? { value, organisation } : null;
  }).filter(v => !!v);

  return {
    title: '#Sondaż',
    polling_firm,
    commissioner: commissioner.split(".")[0],
    fieldwork_start: new Date(fieldwork_start),
    fieldwork_end: new Date(fieldwork_end),
    scope: scope.toLowerCase(),
    sample,
    country: countryMain,
    party_percent,
    source: 'EuropeElects',
  }
}

const getPollsData = async ({ country }) => {
  const { data } = await axios.get(`https://filipvanlaenen.github.io/eopaod/${country}.csv`);

  const rows = data.split("\n").map(r => r.split(","));
  const topRow = rows[0];

  return rows
    .slice(1, 4)
    .map(row => mapRowToModel({row, topRow, country}));
}

module.exports = strapi => {
  return {
    async initialize() {
      strapi.services.europpeelects = {
        getPollsData,
        getRandomCountry
      }
    },
  };
};
