let express = require("express");
const { Zajl } = require("../schemas/Zajl");
const { ConvSchemas } = require("../schemas/Conv");
let router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.send(await Zajl.getAllZajls(req));
  } catch (error) {
    console.log(error);
  }
});
router.post("/", async (req, res) => {
  try {
    res.status(200).send(await Zajl.addZajl(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/areFriends/:id1/:id2", async (req, res) => {
  try {
    // console.log(id1, id2);
    res.status(200).send(await Zajl.areFriends(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/logOut", async (req, res) => {
  try {
    // console.log(id1, id2);
    res.status(200).send(Zajl.logOut(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/myProfilePhoto", async (req, res) => {
  try {
    // console.log(id1, id2);
    res.status(200).send(await Zajl.myProfilePhoto(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/getnumberOfNotif", async (req, res) => {
  try {
    // console.log(id1, id2);
    let result = await Zajl.getnumberOfNotif(req);
    // console.log(result);
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
});
router.get("/alreadySent/:sender/:reciever", async (req, res) => {
  try {
    // console.log(id1, id2);
    res.status(200).send(await Zajl.alreadySent(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/acceptReq/:sender", async (req, res) => {
  try {
    // console.log(id1, id2);
    let sender = req.params.sender;
    let reciever = req.session.idUser;

    req.body.photo = "";
    req.body.nom = "";
    req.body.dernierMessage = "";
    req.body.messageNonLu = 0;
    req.body.participants = [sender, reciever];
    await ConvSchemas.addConv(req);
    res.status(200).send(await Zajl.acceptReq(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/getFriendReqs/", async (req, res) => {
  try {
    // console.log(id1, id2);
    res.status(200).send(await Zajl.getFriendReqs(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/removeFriend/:id", async (req, res) => {
  try {
    // console.log(id1, id2);
    res.status(200).send(await Zajl.removeFriend(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/getZajlByIdUser/:id_user", async (req, res) => {
  try {
    res.status(200).send(await Zajl.getZajlByIdUser(req));
  } catch (error) {
    console.log(error);
  }
});
router.post("/friendReq", async (req, res) => {
  try {
    res.status(200).send(await Zajl.friendReq(req));
  } catch (error) {
    console.log(error);
  }
});

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      res.status(200).send(await Zajl.getZajlById(req));
    } catch (error) {
      console.log(error);
    }
  })
  .put(async (req, res) => {
    try {
      res.status(200).send(await Zajl.updateZajl(req));
    } catch (error) {
      console.log(error);
    }
  })
  .delete(async (req, res) => {
    try {
      res.status(200).send(await Zajl.deleteZajl(req));
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router;
