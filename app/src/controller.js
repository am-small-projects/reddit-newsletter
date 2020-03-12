const dbConn = require("../utils/dbConnection");
const logger = require("../utils/logger");

const controller = {
  addUser: async (
    firstName = null,
    lastName = null,
    email = null,
    timezone = null,
    subscribed = false
  ) => {
    const query = `INSERT INTO reddit_newsletter.user 
                    (first_name, last_name, email, timezone, subscribed) 
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (email) DO UPDATE
                    SET                     
                        subscribed  = EXCLUDED.subscribed   
                    `;
    const values = [firstName, lastName, email, timezone, subscribed];
    try {
      const result = await dbConn.query(query, values);
      if (result.rowCount > 0) return true;
    } catch (err) {
      logger.error(err.message);
    }
    return false;
  },

  updateUser: async (id, firstName, lastName, email, timezone) => {
    const query = `UPDATE reddit_newsletter.user 
                    SET
                        first_name = COALESCE($2, first_name), 
                        last_name  = COALESCE($3, last_name),
                        email      = COALESCE($4, email),
                        timezone   = COALESCE($5, timezone)
                    WHERE id = $1`;
    const values = [id, firstName, lastName, email, timezone];
    try {
      const result = await dbConn.query(query, values);
      if (result.rowCount > 0) return true;
    } catch (err) {
      logger.error(err.message);
    }
    return false;
  },

  updateSubscription: async (email, subscribed) => {
    const query = `UPDATE reddit_newsletter.user 
                    SET subscribed = $2
                    WHERE email = $1`;
    const values = [email, subscribed];
    try {
      const result = await dbConn.query(query, values);
      if (result.rowCount > 0) return true;
    } catch (err) {
      logger.error(err.message);
    }
    return false;
  },

  addFavoriteChannel: async (id, type, url) => {
    let query = `INSERT INTO reddit_newsletter.reddit_channel (channel_type, channel_url) 
                    VALUES ($1, $2) RETURNING id`;

    try {
      const result = await dbConn.query(query, [type, url]);
      const channelId = result.rows[0].id;
      if (result.rowCount > 0) {
        query = `INSERT INTO reddit_newsletter.reddit_favorites (user_id, channel_id)
                    VALUES ($1, $2)`;
        return dbConn.query(query, [id, channelId]);
      }
    } catch (err) {
      logger.error(err.message);
    }
    return false;
  }
};
module.exports = controller;
