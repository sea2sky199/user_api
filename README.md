# README

Compound Match microservice responsible for managing user information for the Compound Match application.

---

### Routes

- **/api-docs** - **GET** - leads to the [Swagger UI](https://swagger.io/tools/swagger-ui/) for documentation and easy testing of the other routes

- **/users** - **GET** - gets a list of all users and some descriptive data about them from the database

- **/userInfo** - **POST** - send a user's session info from WSSO authentication to get Compound Match specific metadata for them. If they don't already exist in the Compound Match app, then add them to the database as a GUEST user.

- **/updateUser/{id}** - **PUT** - updates an attribute for a user, specified by their id in the users table. A user cannot modify their own attributes.

- **/WebSSOUserInfo/{chemdwID}** - **GET** - gets all available info. about a user from Chemdw through their Websso ID

- **/createUser** - **POST** - adds a new user to the database using their Websso ID and the relevant info. that's gathered from Chemdw. If a user with the specified Websso ID already exists in the Compound Match app, then an error is returned.

- **/user/{id}** - **DELETE** - marks the user, as specified by their Compound Match ID, as deleted, removing them from the Compound Match UI. The deleted user will continue to exist in the database, but their permission will be set to GUEST and they will lose finance permissions if they had them. A deleted user can be restored if they are added using their the /createUser route and their WebSSOID.
