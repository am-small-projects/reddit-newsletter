const router = require('express').Router();
const asyncWrapper = require('./asyncWrapper.middleware');
const logger = require('./logger');
/**
 * @swagger
 * definitions:
 *  User:
 *      type: "object"
 *      properties:
 *          id:
 *              type: "integer"
 *          first_name:
 *              type: "string"
 *          last_name:
 *              type: "string"
 */

/**
 * @swagger
 * /user:
 *  post:
 *      description: POST user
 *      parameters:
 *          - name: user
 *            in: formData
 *            required: true
 *            schema:
 *              $ref: "#/definitions/User"
 *      responses:
 *          200:
 *              description: User created successfully
 *          400:
 *              description: "Bad request data"
 */
router.post(
  '/user',
  asyncWrapper(async (req, res) => {
    const { user } = req.body;
    logger.info('user:', user);
    return res.status(200).json('Creating user');
  }),
);

/**
 * @swagger
 * /user/:id:
 *  patch:
 *      description: Update user by id
 *      parameters:
 *          - name: id
 *            in: query
 *            type: number
 *            required: true
 *      request:
 *          'user':
 *              name: String
 *      responses:
 *          '201':
 *              description: User updated successfully
 */
router.patch(
  '/user/:id',
  asyncWrapper(async (req, res) => {
    const { user } = req.body;
    logger.info(user);
    return res.status(201).json('Updating user');
  }),
);

router.post(
  '/user/:id/favorites/reddit',
  asyncWrapper(async (req, res) => {
    const { reddit } = req.body;
    logger.info(reddit);
    return res.json('Adding Fav reddit');
  }),
);

router.patch(
  '/user/favorites/reddit',
  asyncWrapper(async (req, res) => {
    const { reddit } = req.body;
    logger.info(reddit);
    return res.json('Updating Fav reddit');
  }),
);

router.post(
  '/user/newsletter/subscribe',
  asyncWrapper(async (req, res) => {
    const { email } = req.body;
    logger.info(email);
    return res.json('Subscribing to Newsletter');
  }),
);

router.patch(
  '/user/newsletter/preferences',
  asyncWrapper(async (req, res) => {
    const { preferences } = req.body;
    logger.info(preferences);
    return res.json('Updating Newsletter Preferences');
  }),
);

module.exports = router;
