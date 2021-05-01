'use strict';
const { prop } = require('lodash/fp');
const moment = require("moment");
const axios = require("axios");

const getService = name => {
  return prop(`content-manager.services.${name}`, strapi.plugins);
};

module.exports = {
  '37 21 * * *': {
    options: {
      tz: 'Europe/Warsaw',
    },
    task: async () => {
      const tommorowDate = moment().add(1, 'days');
      const formatName = strapi.services.politician.formatName;

      const talks = await strapi.query('talk').find({
        start_gt: tommorowDate.startOf('day').toDate(),
        end_lt: tommorowDate.endOf('day').toDate(),
      });

      for (const key in talks) {
        talks[key].politicians = await strapi.query('politician').find({
          id_in: talks[key].politicians
        }, ['organisation'])
      }

      if (talks.length === 0) {
        return;
      }

      const hashtags = {
        "classic": "#DebataMłodzieżówek",
        "mvsp": "#MłodzieżVsPolitycy",
        "interview": "#WywiadMyPolitics",
        "expert": "#OkiemEksperta",
        "ring": "#RingPolityczny"
      };

      const description = [
        "Jutro w #myPolitics!",
        ...(talks.map(({start, type, politicians}) => {
          const opts = {twitter: true, orgShortName: true};
          const politiciansNames = politicians.map(p => formatName(p, opts));

          const title = {
            0: '',
            1: ` ${politiciansNames[0]}`,
            2: ` ${politiciansNames[0]} VS ${politiciansNames[1]}`
          }

          return `${moment(start).utcOffset(120).format("HH:mm")}${title[politicians.length]} ${hashtags[type]}`
        }))
      ].join("\n\n");

      await axios.post(process.env.EVERYDAY_LIVE_WEBHOOK, {description});
    }
  },
  '00 14 * * 1': () => {
    console.log('ramowka tygodniowa');
  },
  '0 10,16 * * *': {
    options: {
      tz: 'Europe/Warsaw',
    },
    task: async () => {
      return;
      const country = strapi.services.europpeelects.getRandomCountry();
      const pollExists = async ({sample, polling_firm, commissioner, fieldwork_start, fieldwork_end}) =>
        (await strapi.query('poll').find({
          sample: parseInt(sample, 10),
          polling_firm,
          commissioner,
          fieldwork_start,
          fieldwork_end
        })).length > 0;

      const data = await strapi.services.europpeelects.getPollsData({country});
      const dataFiltered = [];

      for (const dataIndex in data) {
        const poll = data[dataIndex];
        if (!(await pollExists(poll))) {
          dataFiltered.push(poll);
        }
      }

      const lastElement = dataFiltered.pop();
      if (lastElement) {
        const entity = await strapi.query('poll').create({
          ...lastElement,
          published_at: null
        });

        const entityManager = getService('entity-manager');
        await entityManager.publish(entity, 'poll')
      }
    },
  },
  '*/1 * * * *': async () => {
    const entityManager = getService('entity-manager');
    const draftPostsToPublish = await strapi.api.smpost.services.smpost.find({
      _publicationState: 'preview',
      publish_on_lt: new Date(),
    });

    draftPostsToPublish
      .filter(entity => !entity.published_at)
      .forEach(entity => entityManager.publish(entity, 'smpost'));
    },
};
