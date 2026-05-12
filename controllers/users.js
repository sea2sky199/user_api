//const chemdwService = require('../services/chemdw')
const assert = require("assert");
const { UsersModel: Model } = require(`../models`);
const debug = require("debug")("CHEM:APP_SVC");

class UsersController {
  static async add(req, res) {
    let WebSSOUserInfo = req.body;
    debug("WebSSOUserInfo", WebSSOUserInfo);
    if (
      !WebSSOUserInfo.webssoId ||
      !WebSSOUserInfo.name ||
      !WebSSOUserInfo.email
    ) {
      debug("Invalid request for /userInfo: ", req.body);
      return res.status(400).send("Invalid Request");
    }
    let webssoid = WebSSOUserInfo.webssoId;
    let newUserFlag = false;
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);

      let user = await Model.oneByWebSSOID(webssoid);
      if (user) {
        const oneWeekInSeconds = 7 * 24 * 60 * 60;
        if (
          !user.last_chemdw_time ||
          user.last_chemdw_time < currentTimestamp - oneWeekInSeconds
        ) {
          //await chemdwService.setChemdwUpdateForUser(
          //    user,
          //    currentTimestamp
          //)
          debug("webssoid", webssoid);
        } else {
          user["WebSSO_meta"] = JSON.stringify(user["WebSSO_meta"]);
        }
        user["last_access_time"] = currentTimestamp;
        await Model.update(user);
      } else {
        newUserFlag = true;
        let newUserInfo = {
          name: WebSSOUserInfo.name,
          user_id: WebSSOUserInfo.webssoId,
          email: WebSSOUserInfo.email,
          last_access_time: currentTimestamp,
          role: "GUEST",
        };

        //await chemdwService.setChemdwUpdateForUser(
        //    newUserInfo,
        //    currentTimestamp
        //)

        // Make the very first user an admin
        let userCount = await Model.count();
        if (userCount === 0) {
          newUserInfo["role"] = "ADMIN";
        }

        let users = await Model.add(newUserInfo);
        user = users[0];
      }
      if (newUserFlag) {
        debug("Created new user from request: ", user);
      }
      res.json(user);
    } catch (err) {
      debug("Exception thrown while processing userInfo: ", err);
      res.status(400).send(err.mesage);
    }
  }

  static async allActive(req, res) {
    try {
      debug("Arrive at allActive");
      let users = await Model.allActive();
      debug("users", users);
      // TODO: performing a onetime update of datetime_added field for existing users on 2019-12-16
      // safe to remove everything up to the res after this is run once in prod
      /*let missingTimestamps = users
        .filter((obj) => {
          return obj.datetime_added === null;
        })
        .filter((obj) => {
          return obj.role != "GUEST";
        });
      missingTimestamps.forEach((user) => {
        user.datetime_added = Math.floor(Date.now() / 1000);
        Model.update(user);
      });*/
      res.json(users);
    } catch (err) {
      res.status(400).send(err.message);
    }
    debug("Complete allActive");
  }

  static async update(req, res) {
    debug("Received update request for id: ", req.params.id);
    debug("BODY: ", req.body);
    let id = req.params.id;
    let currentUserData = await Model.one(id);
    let update = Object.assign(currentUserData, req.body.update);
    //WebSSO_meta is updated by userInfo request (add method)
    delete update.WebSSO_meta;
    try {
      assert(
        id != req.body.auth.id,
        "Not allowed to make permissions changes to your own account",
      );
      assert(id, "User ID not specified");
      assert(Object.keys(update).length, "Update not specified");
      let newUserData = await Model.update({ id, ...update });
      res.send(newUserData);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  static async updateColumnConfig(req, res) {
    const id = req.body.id;
    const colName = req.body.colName;
    const column_config = req.body[colName];
    try {
      assert(id, "User ID not specified");
      assert(Object.keys(column_config).length, "Update not specified");
      const updatedUser = await Model.updateColumnConfig(
        id,
        colName,
        column_config,
      );
      res.status(200).send(updatedUser);
    } catch (err) {
      res.status(400).send(err.message);
    }
  }

  static async oneByWebSSOID(req, res) {
    const webssoId = req.params.webssoId;
    try {
      const WebSSOUserInfo = await Model.oneByWebSSOID(webssoId);
      debug("Received Parsed Chemdw User Info:", WebSSOUserInfo);
      res.json(WebSSOUserInfo);
    } catch (err) {
      debug(err);
      res.status(400).json(err.message);
    }
  }

  static async manualAdd(req, res) {
    try {
      const webssoId = req.body.webssoId;
      const role = req.body.role;
      const privileged_permission = req.body.privileged_permission || false;
      const userAlreadyPresent = await Model.oneByWebSSOID(webssoId);

      if (!!userAlreadyPresent) {
        // if a deleted user is re-added then we restore them
        if (userAlreadyPresent.is_deleted) {
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const returningUser = {
            id: userAlreadyPresent.id,
            role: role,
            privileged_permission: privileged_permission,
            datetime_added: currentTimestamp,
            is_deleted: false,
          };
          const user = await Model.update(returningUser);
          res.send(user);
          return;
        } else {
          const errorMessage = `User with BEMS ID:${webssoId} already exists`;
          console.log(errorMessage);
          throw new Error(errorMessage);
        }
      }

      const name = req.body.name;
      const email = req.body.email;
      assert(webssoId, "webssoId is required");
      assert(name, "name is required");
      assert(email, "email is required");
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const newUser = {
        name,
        user_id: parseInt(webssoId),
        email,
        role,
        privileged_permission,
        datetime_added: currentTimestamp,
      };
      let user = await Model.add(newUser);
      res.send(user);
    } catch (err) {
      debug(err);
      res.status(400).send(err.message);
    }
  }

  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const requestUserId = parseInt(req.body.auth.id);

      if (id === requestUserId) {
        throw new Error(
          "You cannot delete yourself - please contact another site Admin to be removed.",
        );
      } else {
        await Model.delete(id);
        const responseMessage = `User with id ${id} deleted successsfully.`;
        res.send(responseMessage);
      }
    } catch (err) {
      debug(err);
      res.status(400).send(err.message);
    }
  }
}

module.exports = UsersController;
