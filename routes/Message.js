let express = require("express");
let router = express.Router();
let Message = require("../schemas/Message.js");
let { Zajl } = require("../schemas/Zajl.js");
let { User } = require("../schemas/User.js");
let multer = require("multer");
const { ConvSchemas } = require("../schemas/Conv.js");
router.get("/", async (req, res) => {
  try {
    res.status(200).json(await Message.getMessages(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/search/:val/:idConv", async (req, res) => {
  try {
    res.status(200).json(await Message.searchMsg(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/ofConv/:idConv", async (req, res) => {
  try {
    // res.json({ a: 1 });
    let tab = await Message.getMessagesOfConv(req);
    for (let msg of tab) {
      req.params.id_user = msg.id_User;
      let zajl = await Zajl.getZajlByIdUser(req);
      msg.photoUser = zajl.photo;
      req.params.id = msg.id_User;
      let user = await User.getUserById(req);
      msg.nameUser = user.firstName + " " + user.lastName;
      //set the ref message
      let refMsg = await Message.getMessageByIdParams(req, msg.ref);
      msg.refMsg = refMsg;
    }
    //mark messages as seen
    await Message.SetVu(req);
    res.status(200).json(tab);
  } catch (error) {
    console.log(error);
  }
});
router.get("/20ofConv/:idConv/:index", async (req, res) => {
  try {
    let tab = await Message.get20MessagesOfConv(req);
    for (let msg of tab) {
      req.params.id_user = msg.id_User;
      let zajl = await Zajl.getZajlByIdUser(req);
      msg.photoUser = zajl.photo;
      req.params.id = msg.id_User;
      let user = await User.getUserById(req);
      msg.nameUser = user.firstName + " " + user.lastName;
    }
    //mark messages as seen
    await Message.SetVu(req);
    res.status(200).json(tab);
  } catch (error) {
    console.log(error);
  }
});
router.get("/NewofConv/:idConv", async (req, res) => {
  try {
    let tab = await Message.getNewMessagesOfConv(req);

    for (let msg of tab) {
      req.params.id_user = msg.id_User;
      let zajl = await Zajl.getZajlByIdUser(req);
      msg.photoUser = zajl.photo;

      req.params.id = msg.id_User;
      let user = await User.getUserById(req);
      msg.nameUser = user.firstName + " " + user.lastName;
    }
    //mark messages as seen
    await Message.SetVu(req);
    res.status(200).json(tab);
  } catch (error) {
    console.log(error);
  }
});
let mediaSent = multer({ dest: "../Public/imgSent" });
router.post("/", mediaSent.array("files"), async (req, res) => {
  try {
    res.status(200).send(await Message.addMessage(req));
  } catch (error) {
    console.log(error);
  }
});
router.delete("/deleteForMe/:id", async (req, res) => {
  try {
    res.status(200).send(await Message.deleteForMe(req));
  } catch (error) {
    console.log(error);
  }
});
router
  .route("/:id")
  .get(async (req, res) => {
    try {
      res.status(200).send(await Message.getMessageById(req));
    } catch (error) {
      console.log(error);
    }
  })
  .put(async (req, res) => {
    try {
      res.status(200).send(await Message.updateMessage(req));
    } catch (error) {
      console.log(error);
    }
  })
  .delete(async (req, res) => {
    try {
      let msg = await Message.getMessageById(req);
      req.body.idConv = msg.id_Conv;
      req.body.idMsg = req.params.id;
      //to delete irt for the users who fetch msgs from conv
      await ConvSchemas.updateDeletedMsg(req);
      //delet it
      res.status(200).send(await Message.deleteMessage(req));
    } catch (error) {
      console.log(error);
    }
  });
module.exports = router;
