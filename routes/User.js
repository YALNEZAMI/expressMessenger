let express = require("express");
let router = express.Router();
let multer = require("multer");
let { Zajl } = require("../schemas/Zajl.js");
let { ConvSchemas } = require("../schemas/Conv.js");

let { User } = require("../schemas/User.js");

router.get("/", async (req, res) => {
  try {
    const users = await User.getAllUsers(req);
    res.send(users);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", async (req, res) => {
  try {
    res.status(200).send(await User.addUser(req));
  } catch (error) {
    console.log(error);
  }
});
let multUpdateProfile = multer({ dest: "../Public/imgOfZajls/" });
router.post(
  "/updateProfile/:id",
  multUpdateProfile.single("photo"),
  async (req, res) => {
    try {
      if (req.file) {
        await Zajl.updatePhoto(req);
      }
      res.status(200).send(await User.updateUser(req));
    } catch (error) {
      console.log(error);
    }
  }
);
router.post("/login", async (req, res) => {
  try {
    res.status(200).send(await User.login(req));
  } catch (error) {
    console.log(error);
  }
});

router.get("/search/:searchKey", async (req, res) => {
  try {
    res.status(200).send(await User.searchUser(req));
  } catch (error) {
    console.log(error);
  }
});
router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const user = await User.getUserById(req);
      res.status(200).send(user);
    } catch (err) {
      res.status(500).send("Internal Server Error");
    }
  })
  .put(async (req, res) => {
    try {
      res.status(200).send(User.updateUser(req));
      console.log("updated width success");
    } catch (error) {
      console.log(error);
    }
  })
  .delete(async (req, res) => {
    try {
      ConvSchemas.quiteFromAll(req);
      Zajl.deleteZajlByIdUser(req);
      res.status(200).send(await User.deleteUser(req));
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router;
