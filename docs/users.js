/**
 * Swagger Schema Definition
 * @swagger
 * components:
 *   schemas:
 *     UserInfoRequest:
 *       type: object
 *       required:
 *         - webssoId
 *         - name
 *         - email
 *       properties:
 *         webssoId:
 *           type: number
 *         name:
 *           type: string
 *         email:
 *           type: string
 *     createUser:
 *       type: object
 *       required:
 *         - webssoId
 *         - role
 *       properties:
 *         webssoId:
 *           type: number
 *         role:
 *           type: string
 *     updateUser:
 *       type: object
 *       required:
 *         - auth
 *         - update
 *       properties:
 *         auth:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *         update:
 *           type: object
 *           properties:
 *             role:
 *               type: string
 *             privileged_permission:
 *               type: boolean
 *     deleteUser:
 *           type: object
 *           required:
 *             - auth
 *           properties:
 *             auth:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 */

/**
 * @swagger
 * /userInfo:
 *   post:
 *     summary: Returns current user information based on supplied parameters
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInfoRequest'
 *     responses:
 *       200:
 *         description: User retrieved/created ok
 *       400:
 *         description: Invalid request, unable to insert
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Gets all users
 *   responses:
 *     200:
 *       description: List of users
 */

/**
 * @swagger
 * /updateUser/{id}:
 *   put:
 *     summary: Modifies attributes for specified user
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: user id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateUser'
 *     responses:
 *       200:
 *         description: User updated ok
 *       400:
 *         description: Invalid request, unable to update
 */

/**
 * @swagger
 * /WebSSOUserInfo/{webssoId}:
 *   get:
 *     summary: Gets chemdw user info from webssoId
 *     parameters:
 *       - in: path
 *         name: webssoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: BemsId
 *     responses:
 *       200:
 *         description: User info retrieved
 *       400:
 *         description: Invalid request, unable to find webssoId
 */

/**
 * @swagger
 * /createUser:
 *   post:
 *     summary: Adds a new user to the DB manually
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createUser'
 *     responses:
 *       200:
 *         description: User added ok
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Deletes a user using their id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/deleteUser'
 *     responses:
 *       200:
 *         description: User deleted ok
 *       400:
 *         description: Invalid request
 */
