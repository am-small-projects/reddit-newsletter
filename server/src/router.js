const router = require("express").Router();
const asyncWrapper = require("../utils/asyncWrapper.middleware");
const logger = require("../utils/logger");
const controller = require("./controller");

/**
 * @swagger
 * /user:
 *  post:
 *      summary: POST new user
 *      parameters:
 *          - name: firstName
 *            in: body
 *            required: true
 *            schema:
 *              type: "string"
 *          - name: lastName
 *            in: body
 *            required: true
 *            schema:
 *              type: "string"
 *          - name: email
 *            in: body
 *            schema:
 *              type: "string"
 *          - name: subscribed
 *            in: body
 *            required: true
 *            schema:
 *              type: "boolean"
 *      responses:
 *          200:
 *              description: "User created successfully"
 *          400:
 *              description: "Bad request data"
 * 			500:
 * 				description: "Server Error"
 */
router.post(
  "/user",
  asyncWrapper(async (req, res) => {
    const { firstName, lastName, email, timezone } = req.body;
    // TODO: validate user, return 400 if bad request
    const userAdded = await controller.addUser(
      firstName,
      lastName,
      email,
      timezone
    );
    if (userAdded) return res.status(200).json("User created successfully");
    else return res.status(500).json("Server Error");
  })
);

/**
 * @swagger
 * /user/{id}:
 *  patch:
 *      summary: "Update user by id"
 *      parameters:
 *          - name: firstName
 *            in: body
 *            required: true
 *            schema:
 *              type: "string"
 *          - name: lastName
 *            in: body
 *            required: true
 *            schema:
 *              type: "string"
 *          - name: email
 *            in: body
 *            schema:
 *              type: "string"
 *          - name: subscribed
 *            in: body
 *            required: true
 *            schema:
 *              type: "boolean"
 *      responses:
 *          201:
 *              description: "User updated successfully"
 *          400:
 *              description: "Bad request data"
 * 			500:
 * 				description: "Server Error"
 */
router.patch(
  "/user/:id",
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, timezone } = req.body;
    // TODO: validate input, return 400 if bad request
    const userUpdated = await controller.updateUser(
      id,
      firstName,
      lastName,
      email,
      timezone
    );
    if (userUpdated) return res.status(201).json("User updated successfully");
    else return res.status(500).json("Server Error");
  })
);

router.post(
  "/user/newsletter/subscribe",
  asyncWrapper(async (req, res) => {
    const { email, timezone } = req.body;
    // TODO: validate input, return 400 if bad request
    const userSubscribed = await controller.addUser(null, null, email, timezone, true);
    if (userSubscribed) {
      return res.status(200).json("User subscribed to Newsletter");
    } else return res.status(500).json("Server Error");
  })
);

router.patch(
  "/user/:email/newsletter/preferences",
  asyncWrapper(async (req, res) => {
    const { subscribe } = req.body;
    const subscribed = subscribe == "yes" ? true : false;
    const { email } = req.params;
    // TODO: validate input, return 400 if bad request
    const userUpdated = await controller.updateSubscription(email, subscribed);

    // respond to the client
    if (userUpdated)
      return res.status(201).json("User preferences updated successfully");
    else return res.status(500).json("Server Error");
  })
);

router.post(
  "/user/:id/favorites/reddit/channel",
  asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { type, url } = req.body;
    // TODO: validate input, return 400 if bad request
    const channelAdded = await controller.addFavoriteChannel(id, type, url);
    if (channelAdded)
      return res.status(200).json("Added favorite reddit channel");
    else return res.status(500).json("Server Error");
  })
);
/*
router.delete(
  "/user/:userId/favorites/reddit/channel/:channelId",
  asyncWrapper(async (req, res) => {
    const { reddit } = req.body;
    logger.info(reddit);
    return res.json("Deleting Fav reddit");
  })
);
*/

module.exports = router;
