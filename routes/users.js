const router = require("express").Router();
const { UsersController } = require(`../controllers`);

router.get("/users", UsersController.allActive);
router.get("/WebSSOUserInfo/:webssoId", UsersController.oneByWebSSOID);

router.post("/userInfo", UsersController.add);
router.post("/createUser", UsersController.manualAdd);

router.put("/updateUser/:id", UsersController.update);
router.put("/updateColumnConfig", UsersController.updateColumnConfig);

router.delete("/user/:id", UsersController.delete);

module.exports = router;
