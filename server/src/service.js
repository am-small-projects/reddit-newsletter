// for each user, according to their timezone, send daily email at their 8 AM local time

// https://www.npmjs.com/package/node-schedule

const cron = require("node-cron");
const sgMail = require("@sendgrid/mail");
const dbConn = require("../utils/dbConnection");
const logger = require("../utils/logger");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const service = {
  newsletterService: async () => {
    // get distinct timezones from the database
    const timezones = await serviceUtils.getTimezones();
    // schedule the jobs for each timezone
    await service.scheduleJobs(timezones);
  },
  scheduleJobs: async timezones => {
    for (const row of timezones) {
      const { timezone } = row;
      // get recepients for each timezone
      const recepients = await serviceUtils.getRecipients(timezone);
      // set cron job for each timezone
      const schedule = serviceUtils.setCronJob(timezone, recepients);
      logger.info(`Cron Job set for timezone ${timezone}`);
    }
  }
};

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

    console.log(`timezones: `);
    console.log(timezones);
    return timezones;
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

    console.log("timezone: ", timezone);
    console.log(`recipients: `);
    console.log(recepients);
    return recepients;
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
      log.info(r.email);
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

module.exports = service;
