"use strict";

const pollExists = async ({
  sample,
  polling_firm,
  commissioner,
  fieldwork_start,
  fieldwork_end,
}) =>
  (
    await strapi.query("poll").find({
      sample: parseInt(sample, 10),
      polling_firm,
      fieldwork_start,
      fieldwork_end,
      ...(commissioner ? { commissioner } : {}),
    })
  ).length > 0;

module.exports = {
  europeElects: async (ctx, next) => {
    const authenticated =
      ctx.request.header["mypolitics-poll-auth"] === process.env.POLL_AUTH;

    if (!authenticated) {
      ctx.status = 403;
      ctx.body = "No mypolitics-poll-auth header was found";
      await next();
      return;
    }

    const post = ctx.request.body.text;
    const poll = strapi.services.europeelects.postToPollOrNull(post);

    if (!poll || (await pollExists(poll))) {
      ctx.status = 200;
      ctx.body = "No change";
      await next();
      return;
    }

    const entity = await strapi.query("poll").create({
      ...poll,
      published_at: null,
    });

    ctx.status = 200;
    ctx.body = entity._id;
    await next();
  },
};
