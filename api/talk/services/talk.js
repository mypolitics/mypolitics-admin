'use strict';
const moment = require('moment');

const buildDescription = async (data, { withPostamble = false, inFuture = false, withUrl = false }) => {
  const politicians = await strapi.query('politician').find({
    id_in: data.politicians
  });

  const organisations = await strapi.query('organisation').find({
    id_in: data.organisations
  });

  const moderators = await strapi.query('member').find({
    id_in: data.moderators
  });

  const paragraphs = [];

  const config = {
    'mvsp': () => {
      const { name, organisation } = politicians[0];
      return `⭐ ${name} [${organisation.name}] kontra młodzieżówki w kolejnym odcinku #MłodzieżVsPolitycy!`
    },
    'classic': () => {
      const localPostamble = `👉 Organizacje uczestniczące:\n${organisations.map(({name}) => `${name}\n`)}\`}`;
      const additionalText = withPostamble ? `\n\n${localPostamble}` : '';

      return `⭐ ${data.title} - jakie poglądy na tę kwestię ma młodzież? Zapraszamy do oglądania #DebataMłodzieżówek!${additionalText}`
    },
    'interview': () => {
      const { name, organisation } = politicians[0];

      return`⭐ ${name} [${organisation.name}] w #WywiadMyPolitics ${inFuture ? 'opowie' : 'opowiada'} o swoich poglądach na sytuację w Polsce i na świecie!`;
    },
    'expert': () => {
      const { name } = politicians[0];
      return `⭐ ${name} ${inFuture ? 'będzie' : 'jest'} gościem naszego programu #OkiemEksperta, w którym rozmawiamy na złożone tematy okołopolityczne! Tematem tego odcinka ${inFuture ? 'będzie' : 'jest'} ${data.title.toLowerCase()}.`;
    },
    'ring': () => {
      const { name: nameFirst, organisation: partyFirst } = politicians[0];
      const { name: nameSecond, organisation: partySecond } = politicians[1];

      return `⭐ ${inFuture ? 'Zapraszamy na' : 'To'} kolejne starcie na naszym ringu politycznym! ${inFuture ? 'Zmierzą' : 'Zmierzają'} się w nim ${nameFirst} [${partyFirst.name}] i ${nameSecond} [${partySecond.name}].`;
    },
  };

  paragraphs.push(config[data.type]());

  if (inFuture) {
    const date = moment(data.start).locale("pl").format('To już dddd (D.MM) o HH:mm!');
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
https://patronite.pl/mypolitics​​
  
Jesteśmy inicjatywą służącą szerzeniu postaw obywatelskich oraz edukacji politycznej osób w każdym wieku, której główną osią działania jest test poglądów politycznych. Poprzez stronę i nasze social media promujemy politykę młodzieżową oraz zaangażowanie w sprawy publiczne.
  
--
Facebook: https://www.facebook.com/myPoliticsTest​
Instagram: https://www.instagram.com/mypolitics_/​
Twitter: https://twitter.com/myPolitics__​
Discord: https://discord.com/invite/MrcmhByAcS​
Telegram: https://t.me/mypoliticsofficial​

#polityka​ #mypolitics
  
__
Sprawdź wersję 3.0 naszego testu poglądów!
➡️ https://beta.mypolitics.pl`);
  }

  return paragraphs.join(`\n\n`);
};

module.exports = {
  buildDescription,
};
