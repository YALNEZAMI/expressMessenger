let express = require("express");
let cors = require("cors");
let path = require("path");
let session = require("express-session");

let app = express();
// let { User } = require("./schemas/User.js");
let { db } = require("./dataBase/db.js");
let userRouter = require("./routes/User.js");
let zajlRouter = require("./routes/Zajl.js");
let routerConv = require("./routes/Conv.js");
let routerMessage = require("./routes/Message.js");
let { routerSession } = require("./routes/Session.js");

app.use(db());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.use(
  session({
    secret: "Yasser876635", // Replace with your own secret key
    resave: false,
    saveUninitialized: false,
  })
);
//specification sur les droit de edition
const corsOptions = {
  origin: "http://localhost:3000/", // Replace with your frontend domain
};
app.use(cors(corsOptions));
//connection to the data base
app.use(db());

//api user routes
app.use("/api/users", userRouter);
//api conv routes
app.use("/api/zajls", zajlRouter);
//api conv routes
app.use("/api/convs", routerConv);
app.use("/api/messages", routerMessage);

app.use("/api/session", routerSession);

//home page response
const homeHtml = path.join(__dirname, "./Public/views/", "index.html");
app.get("/", (req, res) => {
  res.sendFile(homeHtml);
});
//admin page response
const adminHtml = path.join(__dirname, "./Public/views/", "admin.html");
app.get("/admin", (req, res) => {
  if (req.session.idUser) {
    res.sendFile(adminHtml);
  } else {
    res.redirect("/");
  }
});
//conversation page
const convHtml = path.join(__dirname, "./Public/views/", "conversation.html");
app.get("/conversation/:idConv", (req, res) => {
  if (req.session.idUser) {
    req.session.idConv = req.params.idConv;
    res.send({ href: "http://localhost:3000/conversation" });
  } else {
    res.redirect("/");
  }
});
app.get("/conversation", (req, res) => {
  if (req.session.idUser) {
    res.sendFile(convHtml);
  } else {
    res.redirect("/");
  }
});

//port connection
app.listen(3000 || process.env.PORT, (req, res) => {
  console.log("Server is running on port 3000");
});
