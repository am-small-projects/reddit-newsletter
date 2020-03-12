// for each user, according to their timezone, send daily email at their 8 AM local time
const cron = require("node-cron");
const sgMail = require("@sendgrid/mail");
const axios = require("axios");
const dbConn = require("../utils/dbConnection");
const logger = require("../utils/logger");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const serviceUtils = {
  getTimezones: async () => {
    let timezones = [];
    const query = `SELECT DISTINCT timezone FROM reddit_newsletter.user`;
    try {
      const result = await dbConn.query(query);
      if (result.rowCount > 0) {
        timezones = result.rows;
      }
    } catch (err) {
      logger.error(err.message);
      timezones = null;
    }
    return timezones;
  },
  getChannels: async () => {
    let channels = [];
    const query = `SELECT DISTINCT channel_type, channel_url
                    FROM reddit_newsletter.user u
                    JOIN reddit_newsletter.reddit_favorites f ON (u.id = f.user_id)
                    JOIN reddit_newsletter.reddit_channel c ON (f.channel_id = c.id)
                    WHERE u.subscribed = TRUE`;
    try {
      const result = await dbConn.query(query);
      if (result.rowCount > 0) {
        channels = result.rows;
      }
    } catch (err) {
      logger.error(err.message);
      channels = null;
    }
    return channels;
  },
  getRecipients: async timezone => {
    let recepients = [];
    const query =
      "SELECT DISTINCT email FROM reddit_newsletter.user WHERE timezone = $1";
    try {
      const result = await dbConn.query(query, [timezone]);
      if (result.rowCount > 0) {
        recepients = result.rows;
      }
    } catch (err) {
      logger.error(err.message);
      recepients = null;
    }

    return recepients;
  },
  getTopPosts: async (channels, count) => {
    let posts = [];
    const redditBaseUrl = "http://api.reddit.com/r/"; // format: "http://www.reddit.com/r/subreddit/top/.json?limit=3";
    for (const c of channels) {
      try {
        const result = await axios.get(
          `${c.channel_url}/top.json?limit=${count}`
        );
        const topPosts = [];
        for (const p of result.data.data.children) {
          const post = {
            title: p.data.title,
            url: p.data.url,
            thumbnail: p.data.thumbnail,
            author: p.data.author,
            rating: p.data.ups
          };
          topPosts.push(post);
        }
        posts.push({
          channel: c.channel_type,
          topPosts
        })

      } catch (err) {
        logger.error(err.message);
        posts = null;
      }
    }

    return posts;
  },
  setCronJob: (timezone, recepients) => {
    logger.info("Setting cron job");
    cron.schedule(
      "0 8 * * *",
      () => {
        logger.info(
          `Sending email daily at 8 AM of ${timezone} timezone. 
            Server time when it happend was ${new Date()}`
        );
        serviceUtils.sendEmails(recepients);
      },
      {
        scheduled: true,
        timezone
      }
    );
  },
  sendEmails: recepients => {
    for (let r of recepients) {
      const msg = {
        to: r.email,
        from: "info@reddit-newsletter.com",
        subject: "Sending with Twilio SendGrid is Fun",
        text: "and easy to do anywhere, even with Node.js",
        html: "<strong>and easy to do anywhere, even with Node.js</strong>"
      };
      sgMail.send(msg);
    }
  }
};

const service = {
  newsletterService: async () => {
    console.log(`
    ********** Reddit Newsletter Service **********
    `);
    // get distinct timezones from the database
    const timezones = await serviceUtils.getTimezones();
    logger.info(`timezones: `);
    logger.info(timezones);

    // get distinct reddit channels among all the subscribed users
    const redditChannels = await serviceUtils.getChannels();
    logger.info(`channels:`);
    logger.info(redditChannels);

    // get top 3 posts for each channel
    const topPosts = await serviceUtils.getTopPosts(redditChannels, 3);
    logger.info(`top posts:`);
    logger.info(topPosts);

    // schedule the jobs for each timezone
    await service.scheduleJobs(timezones);
  },
  scheduleJobs: async timezones => {
    for (const row of timezones) {
      const { timezone } = row;
      // get recepients for each timezone
      const recepients = await serviceUtils.getRecipients(timezone);

      logger.info(`timezone: ${timezone}`);
      logger.info(`recipients: `);
      logger.info(recepients);

      // set cron job for each timezone
      serviceUtils.setCronJob(timezone, recepients);
      logger.info(`Cron Job set for timezone ${timezone}`);
    }
  }
};

module.exports = service;
