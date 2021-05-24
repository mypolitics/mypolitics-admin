'use strict';
const moment = require('moment');

const buildImageData = async (data) => {
  const politicians = await strapi.query('politician').find({
    id_in: data.politicians || [],
  }, ['organisation']);

  const organisations = await strapi.query('organisation').find({
    id_in: data.organisations || []
  });

  const date = moment(data.start).utcOffset(120).locale("pl").format('D.MM (dddd) HH:mm')

  const methods = {
    'mvsp': async () => {
      const [firstName, lastName] = politicians[0].name.split(" ");

      return {
        template: 'mvsp',
        data: {
          firstName,
          lastName,
          date,
          imageSrc: politicians[0].image.url
        }
      }
    },
    'classic': async () => {
      return {
        template: 'dm',
        data: {
          topic: data.title,
          date,
          organisations: organisations.map(o => o.logo.url)
        }
      }
    },
    'interview': async () => {
      const names = politicians[0].name.split(" ");
      const [firstName, lastName] = names.length === 2 ? names : names.slice(1);

      return {
        template: 'interview',
        data: {
          firstName,
          lastName,
          date,
          imageSrc: politicians[0].image.url,
          partyName: politicians[0].organisation.name,
          partySrc: politicians[0].organisation.logo.url,
        }
      }
    },
    'expert': async () => {
      const names = politicians[0].name.split(" ");
      const [firstName, lastName] = names.length === 2 ? names : names.slice(1);

      return {
        template: 'oe',
        data: {
          firstName,
          lastName,
          date,
          imageSrc: politicians[0].image.url
        },
      }
    },
    'ring': async () => {
      const persons = politicians.map(async (p) => {
        const [firstName, lastName] = p.name.split(" ");
        const orgData = !!p?.organisation ? {
          partyName: p.organisation.name,
          partySrc: p.organisation.logo.url
        } : {};

        return {
          firstName,
          lastName,
          imageSrc: p.image.url,
          ...orgData
        }
      });

      return {
        template: 'rp',
        data: {
          persons: await Promise.all(persons),
        }
      }
    }
  };

  return methods[data.type]();
};

const buildDescription = async (data, { withPostamble = false, inFuture = false, withUrl = false, twitter = false }) => {
  const formatName = strapi.services.politician.formatName;
  const formatNameOptions = { twitter, orgShortName: twitter };

  const politicians = await strapi.query('politician').find({
    id_in: data.politicians || []
  });

  const organisations = await strapi.query('organisation').find({
    id_in: data.organisations || []
  });

  const moderators = await strapi.query('member').find({
    id_in: data.moderators || []
  });

  const paragraphs = [];

  const config = {
    'mvsp': () => {
      return `⭐ ${formatName(politicians[0], formatNameOptions)} kontra młodzieżówki w kolejnym odcinku #MłodzieżVsPolitycy!`
    },
    'classic': () => {
      const orgs = organisations.map(({name}) => name).join("\n");
      const localPostamble = `👉 Organizacje uczestniczące:\n${orgs}`;
      const additionalText = withPostamble ? `\n\n${localPostamble}` : '';

      return `⭐ ${data.title} - jakie poglądy na tę kwestię ma młodzież? Zapraszamy do oglądania #DebataMłodzieżówek!${additionalText}`
    },
    'interview': () => {
      return `⭐ ${formatName(politicians[0], formatNameOptions)} w #WywiadMyPolitics ${inFuture ? 'opowie' : 'opowiada'} o swoich poglądach na sytuację w Polsce i na świecie!`;
    },
    'expert': () => {
      const { name } = politicians[0];
      return `⭐ ${name} ${inFuture ? 'będzie' : 'jest'} gościem naszego programu #OkiemEksperta, w którym rozmawiamy na złożone tematy okołopolityczne! Tematem tego odcinka ${inFuture ? 'będzie' : 'jest'} ${data.title}.`;
    },
    'ring': () => {
      return `⭐ ${inFuture ? 'Zapraszamy na' : 'To'} kolejne starcie na naszym #RingPolityczny! ${inFuture ? 'Zmierzą' : 'Zmierzają'} się w nim ${formatName(politicians[0], formatNameOptions)} i ${formatName(politicians[1], formatNameOptions)}.`;
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

    const date = moment(data.start).utcOffset(120).locale("pl").format(`[To już ${dayName}] (D.MM) o HH:mm!`);
    paragraphs.push(date)
  }

  if (withUrl) {
    paragraphs.push(`🔴 Transmisja YouTube 🔴\n👉 ${data.url}`)
  }

  if (withPostamble && moderators.length > 0) {
    paragraphs.push(`👉 Wydarzenie prowadzi ${moderators[0].name}.`)
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
};
