let express = require("express");
let router = express.Router();
let multer = require("multer");
let { ConvSchemas } = require("../schemas/Conv.js");

router.get("/", async (req, res) => {
  try {
    res.status(200).json(await ConvSchemas.getConvs(req));
  } catch (error) {
    console.log(error);
  }
});

//my convs route
router.get("/mine", async (req, res) => {
  try {
    res.status(200).json(await ConvSchemas.getMyConvs(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/search/:searchKey", async (req, res) => {
  try {
    res.status(200).json(await ConvSchemas.searchConv(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/getOurConvId/:id1/:id2", async (req, res) => {
  try {
    res.status(200).json(await ConvSchemas.getOurConvId(req));
  } catch (error) {
    console.log(error);
  }
});
router.get("/nameAndPhoto", async (req, res) => {
  try {
    res.status(200).json(await ConvSchemas.nameAndPhoto(req));
  } catch (error) {
    console.log(error);
  }
});
router.post("/deleteParticipant", async (req, res) => {
  try {
    res.status(200).json(await ConvSchemas.quiteConv(req));
  } catch (error) {
    console.log(error);
  }
});

let uploadImgOfConvs = multer({ dest: "../Public/imgOfConvs/" });
router.post(
  "/update/:id",
  uploadImgOfConvs.single("photo"),
  async (req, res) => {
    try {
      res.status(200).json(await ConvSchemas.updateNameAndPhoto(req));
    } catch (error) {
      console.log(error);
    }
  }
);

router.post("/", async (req, res) => {
  try {
    // console.log(req.body);
    res.status(200).send(await ConvSchemas.addConv(req));
  } catch (error) {
    console.log(error);
  }
});
router.post("/updateToDelete/:id", async (req, res) => {
  try {
    // console.log(req.body);
    res.status(200).send(await ConvSchemas.updateToDelete(req));
  } catch (error) {
    console.log(error);
  }
});
router
  .route("/:id")
  .get(async (req, res) => {
    try {
      res.status(200).send(await ConvSchemas.getConvById(req));
    } catch (error) {
      console.log(error);
    }
  })
  .put(async (req, res) => {
    try {
      res.status(200).send(await ConvSchemas.updateConv(req));
    } catch (error) {
      console.log(error);
    }
  })
  .delete(async (req, res) => {
    try {
      res.status(200).send(await ConvSchemas.deleteConv(req));
    } catch (error) {
      console.log(error);
    }
  });

module.exports = router;
