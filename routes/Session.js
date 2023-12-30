let express = require("express");
let router = express.Router();

router.get("/", async (req, res) => {
  try {
    let session = {
      id: req.session.id,
      idUser: parseInt(req.session.idUser),
      idConv: parseInt(req.session.idConv),
    };
    res.send(session);
  } catch (error) {
    console.log(error);
  }
});
router.post("/", async (req, res) => {
  try {
    req.session.idUser = req.body.idUser;
    req.session.idConv = parseInt(req.body.idConv);
    res.send({ message: "session updated" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = {
  routerSession: router,
};
