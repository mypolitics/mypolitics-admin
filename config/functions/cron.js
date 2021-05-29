"use strict";
const { prop } = require("lodash/fp");
const moment = require("moment");
const axios = require("axios");

const getService = (name) => {
  return prop(`content-manager.services.${name}`, strapi.plugins);
};

const productionWrapper = async (func) => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  return func();
}

const everydayLives = async () => {
  const tommorowDate = moment().add(1, "days");
  const formatName = strapi.services.politician.formatName;
  const getHashtag = strapi.services.talk.getHashtag;

  const talks = await strapi.query("talk").find({
    start_gt: tommorowDate.startOf("day").toDate(),
    end_lt: tommorowDate.endOf("day").toDate(),
    _publicationState: "live"
  });

  for (const key in talks) {
    talks[key].politicians = await strapi.query("politician").find(
      {
        id_in: talks[key].politicians,
      },
      ["organisation"]
    );
  }

  if (talks.length === 0) {
    return;
  }

  const description = [
    "Jutro w #myPolitics!",
    ...talks.map(({ start, type, politicians }) => {
      const opts = { twitter: true, orgShortName: true };
      const politiciansNames = politicians.map((p) => formatName(p, opts));

      const title = {
        0: "",
        1: ` ${politiciansNames[0]}`,
        2: ` ${politiciansNames[0]} VS ${politiciansNames[1]}`,
      };

      return `${moment(start).utcOffset(120).format("HH:mm")}${
        title[politicians.length]
      } ${getHashtag({ type })}`;
    }),
  ].join("\n\n");

  await axios.post(process.env.EVERYDAY_LIVE_WEBHOOK, { description });
};

const autoPublishSmPosts = async () => {
  const entityManager = getService("entity-manager");
  const draftPostsToPublish = await strapi.api.smpost.services.smpost.find({
    _publicationState: "preview",
    publish_on_lt: new Date(),
  });

  draftPostsToPublish
    .filter((entity) => !entity.published_at)
    .forEach((entity) => entityManager.publish(entity, "smpost"));
};

const talkProcess = async () => {
  const currentMoment = new Date();
  const toMinutesFromStart = date => Math.abs(new Date(date) - currentMoment) / 60 / 1000;
  const getHashtag = strapi.services.talk.getHashtag;

  const publishOnStart = async ({ start, description, description_twitter, thumbnail }) => {
    const minutesFromStart = toMinutesFromStart(start);
    const alreadyPublished = await strapi.query('smpost').findOne({
      _publicationState: "preview",
      description,
    });

    if (minutesFromStart > 10 || alreadyPublished) {
      return;
    }

    await strapi.api.smpost.services.smpost.create({
      description,
      description_twitter,
      image: thumbnail._id,
      publish_on: currentMoment,
      published_at: null,
    });    
  }

  const publishLiveComments = async (data) => {
    const minutesFromStart = toMinutesFromStart(start);

    if ((minutesFromStart % 7) !== 0) {
      return;
    }

    await axios.post(process.env.TWEET_YT_WEBHOOK, {
      hashtag: getHashtag(data).slice(1),
      youtube_id: data.url.split("?v=").pop()
    });
  }

  const currentTalks = await strapi.api.talk.services.talk.find({
    end_gt: currentMoment,
    start_lt: currentMoment,
  });

  await Promise.all(currentTalks.map(async (data) => {
    await publishOnStart(data);
    await publishLiveComments(data);
  }));
}

module.exports = {
  "37 21 * * *": {
    options: {
      tz: "Europe/Warsaw",
    },
    task: () => productionWrapper(everydayLives),
  },
  "*/1 * * * *": async () => {
    productionWrapper(autoPublishSmPosts)
    productionWrapper(talkProcess)
  }
};
