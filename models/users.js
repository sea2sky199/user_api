//const env = process.env.NODE_ENV;
const env = 'development';
const knexx = require('knex');

const { dbConfig: config } = require("../config");

const knex = knexx(config[env]);
const debug = require("debug")("CHEM:APP_DATA_SVC");

// Apply migrations to the current database
//debug("dbConfig: config", config[env]);
//debug("knex.migrate env", env);
//knex.migrate.latest().then(() => {
 // debug("knex.migrate.latest");
//  return config[env].seeds !== undefined ? knex.seed.run() : null;
//});
debug("Arrive at Class User");
class User {
  static async add(userData) {
    const role = userData.role;

    if (role === "GUEST") {
      userData.privileged_permission = false;
    }

    const ids = await knex("users").insert(userData);
    const user = await knex("users").where("id", ids[0]);
    return user;
  }

  static async update(userData) {
    const id = userData.id;
    const role = userData.role;
    const datetimeAdded = userData.datetime_added;

    if (!id) {
      debug("Invalid user data: ", userData);
      throw new Error("Invalid user data");
    }

    if (role === "GUEST") {
      userData.privileged_permission = false;
    }

    if (!datetimeAdded && typeof role === "string" && role != "GUEST") {
      userData.datetime_added = Math.floor(Date.now() / 1000);
    }

    await knex("users").where("id", id).update(userData);
    let user = await knex("users").where("id", id);
    return user;
  }

  static async updateColumnConfig(id, colName, column_config) {
    await knex("users")
      .where("id", id)
      .update({ [colName]: JSON.stringify(column_config) });
    const user = await knex("users").where("id", id);
    return user;
  }

  static async all() {
    let users = await knex("users").clone();
    return users;
  }

  static async allActive() {
    return knex('users').where('is_deleted', false).select();
  }

  static async count() {
    let cnt = await knex("users").count();
    return cnt["0"]["count(*)"];
  }

  static async one(id) {
    let user = await knex("users").where("id", id).first();
    return user;
  }

  static async oneByWebSSOID(WebSSOId) {
    let user = await knex("users").where("user_id", WebSSOId).first();
    return user;
  }

  static async delete(id) {
    await knex("users").where("id", id).update({
      is_deleted: true,
      role: "GUEST",
      privileged_permission: false,
    });
  }
}

module.exports = User;
