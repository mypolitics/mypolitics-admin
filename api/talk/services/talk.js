"use strict";
const moment = require("moment");

const hashtags = {
  classic: "#DebataMłodzieżówek",
  dl: "#DebataLiderów",
  int_deb: "#InternationalDebate",
  kp: "#KomentarzPolityczny",
  lo: "#LustrzaneOdbicie",
  pt: "#PolitycznyThrowback",
  ptyg: "#PodsumowanieTygodnia",
  qi: "#QuickfireInterview",
  mvsp: "#MłodzieżVsPolitycy",
  interview: "#WywiadDnia",
  expert: "#OkiemEksperta",
  ring: "#RingPolityczny",
};

const getHashtag = (data) => hashtags[data.type];

const toPoliticianWithSeparatedNames = (politician) => {
  const names = politician.name.split(" ");
  const [firstName, lastName] = names.length === 2 ? names : names.slice(1);

  return {
    firstName,
    lastName,
    ...politician,
  };
};

const buildImageData = async (data) => {
  const politicians = (
    await strapi.query("politician").find(
      {
        id_in: data.politicians || [],
      },
      ["organisation"]
    )
  ).map(toPoliticianWithSeparatedNames);

  const organisations = await strapi.query("organisation").find({
    id_in: data.organisations || [],
  });

  return {
    template: data.type,
    data: {
      ...data,
      ...(politicians.length > 0 ? politicians[0] : {}),
      politicians,
      organisations,
    }
  }
};

const buildDescription = async (
  data,
  { withPostamble = false, inFuture = false, withUrl = false, twitter = false }
) => {
  const formatName = strapi.services.politician.formatName;
  const formatNameOptions = { twitter, orgShortName: twitter };

  const politicians = await strapi.query("politician").find({
    id_in: data.politicians || [],
  });

  const organisations = await strapi.query("organisation").find({
    id_in: data.organisations || [],
  });

  const moderators = await strapi.query("member").find({
    id_in: data.moderators || [],
  });

  const paragraphs = [];

  const config = {
    mvsp: () => {
      return `⭐ ${formatName(
        politicians[0],
        formatNameOptions
      )} kontra młodzieżówki w kolejnym odcinku #MłodzieżVsPolitycy!`;
    },
    classic: () => {
      const orgs = organisations.map(({ name }) => name).join("\n");
      const localPostamble = `👉 Organizacje uczestniczące:\n${orgs}`;
      const additionalText = withPostamble ? `\n\n${localPostamble}` : "";

      return `⭐ ${data.title} - jakie poglądy na tę kwestię ma młodzież? Zapraszamy do oglądania #DebataMłodzieżówek!${additionalText}`;
    },
    int_deb: () => {
      const orgs = organisations.map(({ name }) => name).join("\n");
      const localPostamble = `👉 Organisations participating:\n${orgs}`;
      const additionalText = withPostamble ? `\n\n${localPostamble}` : "";

      return `⭐ ${data.title} - what are the views of young people on this topic? Watch #InternationalDebate!${additionalText}`;
    },
    interview: () => {
      return `⭐ ${formatName(
        politicians[0],
        formatNameOptions
      )} w #WywiadDnia!`;
    },
    qi: () => {
      return `⭐ ${formatName(
        politicians[0],
        formatNameOptions
      )} w #QuickfireInterview!`;
    },
    pt: () => {
      return `⭐ ${formatName(
        politicians[0],
        formatNameOptions
      )} w #PolitycznyThrowback!`;
    },
    expert: () => {
      const { name } = politicians[0];
      return `⭐ ${name} ${
        inFuture ? "będzie" : "jest"
      } gościem naszego programu #OkiemEksperta, w którym rozmawiamy na złożone tematy okołopolityczne! Tematem tego odcinka ${
        inFuture ? "będzie" : "jest"
      } ${data.title.split(" – ")[0]}.`;
    },
    ring: () => {
      return `⭐ ${
        inFuture ? "Zapraszamy na" : "To"
      } kolejne starcie na naszym #RingPolityczny! ${
        inFuture ? "Zmierzą" : "Zmierzają"
      } się w nim ${formatName(
        politicians[0],
        formatNameOptions
      )} i ${formatName(politicians[1], formatNameOptions)}.`;
    },
    lo: () => {
      return `⭐ ${
        inFuture ? "Zapraszamy na" : "To"
      } kolejne #LustrzaneOdbicie! ${
        inFuture ? "Zmierzą" : "Zmierzają"
      } się w nim ${formatName(
        politicians[0],
        formatNameOptions
      )} i ${formatName(politicians[1], formatNameOptions)}.`;
    },
    dl: () => {
      return `Zapraszamy na kolejny odcinek #DebataLiderów!`
    },
    kp: () => {
      return `Zapraszamy na kolejny odcinek #KomentarzPolityczny!`
    },
    ptyg: () => {
      return `Zapraszamy na kolejny odcinek #PodsumowanieTygodnia!`
    },
  };

  paragraphs.push(config[data.type]());

  if (inFuture) {
    const dayDeclination = [
      "w niedzielę",
      "w poniedziałek",
      "we wtorek",
      "w środę",
      "w czwartek",
      "w piątek",
      "w sobotę",
    ];
    const dateBase = moment(data.start);
    const dayName = dayDeclination[dateBase.day()];

    const date = moment(data.start)
      .utcOffset(120)
      .locale("pl")
      .format(`[To już ${dayName}] (D.MM) o HH:mm!`);
    paragraphs.push(date);
  }

  if (withUrl) {
    paragraphs.push(`🔴 Transmisja YouTube 🔴\n👉 ${data.url}`);
  }

  if (withPostamble && moderators.length > 0) {
    paragraphs.push(`👉 Wydarzenie prowadzi ${moderators[0].name}.`);
  }

  if (withPostamble) {
    paragraphs.push(`
--
Nie mamy powiązania z żadną opcją wpływu i nikt nas nie finansuje. Możesz wesprzeć nasze działania poprzez Patronite:
https://patronite.pl/mypolitics

Jesteśmy inicjatywą służącą szerzeniu postaw obywatelskich oraz edukacji politycznej osób w każdym wieku, której główną osią działania jest test poglądów politycznych. Poprzez stronę i nasze social media promujemy politykę młodzieżową oraz zaangażowanie w sprawy publiczne.

--
Facebook: https://www.facebook.com/myPoliticsTest
Instagram: https://www.instagram.com/mypolitics_/
Twitter: https://twitter.com/myPolitics__
Discord: https://discord.com/invite/MrcmhByAcS
Telegram: https://t.me/mypoliticsofficial
#polityka #mypolitics

__
Sprawdź wersję 3.0 naszego testu poglądów!
➡️ https://mypolitics.pl/
`);
  }

  return paragraphs.join(`\n\n`);
};

module.exports = {
  buildDescription,
  buildImageData,
  getHashtag,
};
