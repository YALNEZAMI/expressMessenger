let path = require("path");
let fs = require("fs");
class Message {
  static ConvToUpdate = [];
  constructor(
    id,
    contenu,
    media,
    reaction,
    date,
    id_Conv,
    id_User,
    vu,
    invisibilty,
    ref
  ) {
    //id type int
    this.id = id;
    //contenu type string
    this.contenu = contenu;
    //media type array of string
    this.media = media;
    //reaction type array of string
    this.reaction = reaction;
    //date type date
    this.date = date;
    //id_Conv type int
    this.id_Conv = id_Conv;
    //id_User type int
    this.id_User = id_User;
    //vu type array of int
    this.vu = vu;
    //invisibilty type array of int
    this.invisibilty = invisibilty;
    //ref type int (id of the message that this message is a reply to)
    this.ref = ref;
  }
  getRef() {
    return this.ref;
  }
  setRef(ref) {
    this.ref = ref;
  }
  getInvisibilty() {
    return this.invisibilty;
  }
  setInvisibilty(invisibilty) {
    this.invisibilty = invisibilty;
  }
  getVu() {
    return this.vu;
  }
  setVu(vu) {
    this.vu = vu;
  }
  getId() {
    return this.id;
  }
  getContenu() {
    return this.contenu;
  }
  getMedia() {
    return this.media;
  }
  getReaction() {
    return this.reaction;
  }
  getDate() {
    return this.date;
  }
  getId_Conv() {
    return this.id_Conv;
  }
  getId_User() {
    return this.id_User;
  }
  setId(id) {
    this.id = id;
  }
  setContenu(contenu) {
    this.contenu = contenu;
  }
  setMedia(media) {
    this.media = media;
  }
  setReaction(reaction) {
    this.reaction = reaction;
  }
  setDate(date) {
    this.date = date;
  }
  setId_Conv(id_Conv) {
    this.id_Conv = id_Conv;
  }
  setId_User(id_User) {
    this.id_User = id_User;
  }
  static async getMessages(req) {
    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM messages", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
  static async addMessage(req) {
    try {
      if (req.files.length == 0 && req.body.contenu.trim() == "") {
        console.log("no content");

        return { error: "no content" };
      } else {
        let contenu = req.body.contenu;
        // media = media.join(",");
        let reaction = "";
        let date = new Date();
        date = date.toISOString().slice(0, 19).replace("T", " ");
        let id_Conv = req.body.id_Conv;
        let id_User = req.session.idUser;
        let vu = "" + req.session.idUser;
        let invisibility = "";
        let ref = req.body.ref;
        // vu = vu.join(",");

        let files = req.files;
        let dbFiles = "";
        for (let file of files) {
          let tmpPath = file.path;
          let originalname = file.originalname;
          let dbName = "../imgSent/" + id_User + originalname;
          if (dbFiles == "") {
            dbFiles += dbName;
          } else {
            dbFiles += "," + dbName;
          }
          let dest = path.join(
            __dirname,
            "../Public/imgSent",
            id_User + originalname
          );
          fs.rename(tmpPath, dest, (err) => {
            if (err) console.log(err);
          });
        }
        let connection = await new Promise((resolve, reject) => {
          req.getConnection((err, connection) => {
            if (err) reject(err);
            resolve(connection);
          });
        });

        return new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO messages (contenu, media, reaction, date, id_Conv, id_User, vu,invisibility,ref) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)",
            [
              contenu,
              dbFiles,
              reaction,
              date,
              id_Conv,
              id_User,
              vu,
              invisibility,
              ref,
            ],
            (err, result) => {
              if (err) reject(err);
              result.media = dbFiles;
              resolve(result);
            }
          );
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  static async getLastMessage(req) {
    let idConv = req.params.idConv;
    let allMessage = await Conv.getMessagesOfConv(req, idConv);
    let lastMessage = allMessage[allMessage.length - 1];
    return lastMessage;
  }
  static async deleteForMe(req) {
    try {
      let id = req.params.id;
      let myid = req.session.idUser;
      let connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) reject(err);
          resolve(connection);
        });
      });
      let message = await this.getMessageByIdParams(req, id);
      let invisibility = message.invisibility;
      if (invisibility == "") {
        invisibility = "" + myid;
      } else {
        invisibility = invisibility + "," + myid;
      }
      return new Promise((resolve, reject) => {
        connection.query(
          "UPDATE messages SET invisibility = ? WHERE id = ?",
          [invisibility, id],
          (err, result) => {
            if (err) reject(err);
            resolve(result);
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async getMessagesOfConv(req) {
    let idUser = req.session.idUser;
    let idConv = req.params.idConv;
    let allMessage = await this.getMessages(req);
    let messagesOfConv = [];
    allMessage.forEach((message) => {
      if (message.id_Conv == idConv) {
        let invisibility = message.invisibility;
        let invisibilityTab = invisibility.split(",");
        if (!invisibilityTab.includes(idUser.toString())) {
          messagesOfConv.push(message);
        }
      }
    });

    return messagesOfConv;
  }
  static async searchMsg(req) {
    try {
      let val = req.params.val;
      val = val.toLowerCase();
      val = val.trim();
      // let idConv = req.params.idConv;
      let allMessage = await this.getMessagesOfConv(req);
      let messagesOfConv = [];
      for (let msg of allMessage) {
        let contenu = msg.contenu;
        contenu = contenu.toLowerCase();
        contenu = contenu.trim();
        if (contenu.includes(val)) {
          messagesOfConv.push(msg);
        }
      }
      return messagesOfConv;
    } catch (error) {
      console.log(error);
    }
  }
  static async get20MessagesOfConv(req) {
    let idUser = req.session.idUser;
    let idConv = req.params.idConv;
    let index = req.params.index;
    let allMessage = await this.getMessagesOfConv(req);
    let messagesOfConv = [];
    //variable to check if there is no more messages
    let noMore = false;

    if (allMessage.length < 20) {
      noMore = true;
      for (let message of allMessage) {
        if (message.id_Conv == idConv) {
          let invisibility = message.invisibility;
          let invisibilityTab = invisibility.split(",");
          if (!invisibilityTab.includes(idUser.toString())) {
            //set noMore to true
            message.noMore = noMore;
            //set the ref message
            let refMsg = await this.getMessageByIdParams(req, message.ref);
            message.refMsg = refMsg;
            //push the message
            messagesOfConv.push(message);
          }
        }
      }
    } else {
      let start = allMessage.length - 20 - index;
      let end = allMessage.length - index;
      //if less than 20 messages remained
      if (start < 0) {
        start = 0;
        allMessage = allMessage.slice(start, end);
        noMore = true;
      } else {
        start = allMessage.length - 20 - index;
        end = allMessage.length - index;

        allMessage = allMessage.slice(start, end);
      }
      for (let message of allMessage) {
        if (!message) {
          break;
        }
        //check if the message is of the conv
        if (message.id_Conv == idConv) {
          //check if the message is not invisible for the user

          let invisibility = message.invisibility;
          let invisibilityTab = invisibility.split(",");
          if (!invisibilityTab.includes(idUser.toString())) {
            //set noMore to true
            message.noMore = noMore;
            //set the ref message
            if (await this.getMessageByIdParams(req, message.ref)) {
              let refMsg = await this.getMessageByIdParams(req, message.ref);
              message.refMsg = refMsg;
            }
            //push the message
            messagesOfConv.push(message);
          }
        }
      }
    }
    // console.log(messagesOfConv);
    return messagesOfConv.reverse();
  }

  static async getNewMessagesOfConv(req) {
    let idConv = req.params.idConv;
    let allMessage = await this.getMessages(req);
    let messagesOfConv = [];
    for (let message of allMessage) {
      let vu = message.vu;
      let vuTab = vu.split(",");
      let idUser = req.session.idUser;

      if (message.id_Conv == idConv && !vuTab.includes(idUser.toString())) {
        //set the ref message
        if (await this.getMessageByIdParams(req, message.ref)) {
          let refMsg = await this.getMessageByIdParams(req, message.ref);
          message.refMsg = refMsg;
        }
        messagesOfConv.push(message);
      }
    }

    return messagesOfConv;
  }
  static async SetVu(req) {
    try {
      // let idConv = req.params.idConv;
      let idUser = req.session.idUser;
      let connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) reject(err);
          resolve(connection);
        });
      });

      let tab = await this.getMessagesOfConv(req);
      for (let msg of tab) {
        let vu = msg.vu;
        let vuSplit = vu.split(",");
        let vuFinal;
        if (!vuSplit.includes(idUser.toString())) {
          if (msg.vu == "") {
            vuFinal = "" + idUser;
          } else {
            vuFinal = msg.vu + "," + idUser;
          }
          await new Promise((resolve, reject) => {
            connection.query(
              "UPDATE messages SET vu =? WHERE id = ?",
              [vuFinal, msg.id],
              (err, result) => {
                if (err) reject(err);
                resolve(result);
              }
            );
          });
        }
      }
      return 1;
    } catch (error) {
      console.log(error);
    }
  }

  static async getMessageById(req) {
    let id = req.params.id;
    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM messages WHERE id = ?",
        [id],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0]);
        }
      );
    });
  }
  static async getMessageByIdParams(req, id) {
    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM messages WHERE id = ?",
        [id],
        (err, result) => {
          if (err) reject(err);
          resolve(result[0]);
        }
      );
    });
  }
  static async updateMessage(req) {
    let id = req.params.id;
    let contenu = req.body.contenu;
    let media = req.body.media;
    media = media.join(",");
    let reaction = req.body.reaction;
    reaction = reaction.join(",");
    let date = req.body.date;
    let id_Conv = req.body.id_Conv;
    let id_User = req.body.id_User;
    let vu = req.body.vu;
    let invisibility = req.body.invisibilty;
    let ref = req.body.ref;
    vu = vu.join(",");

    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });

    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE messages SET contenu = ?, media = ?, reaction = ?, date = ?, id_Conv = ?, id_User = ?, vu = ?,invisibility=?,ref=? WHERE id = ?",
        [
          contenu,
          media,
          reaction,
          date,
          id_Conv,
          id_User,
          vu,
          invisibility,
          ref,
          id,
        ],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
  static async deleteMessage(req) {
    let id = req.params.id;
    let msg = await this.getMessageByIdParams(req, id);
    let idConv = msg.id_Conv;
    let files = msg.media;
    files = files.split(",");
    for (let file of files) {
      let oldpath = path.join(__dirname, "../Public/imgSent/", file);
      // console.log(oldpath);
      fs.unlink(oldpath, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
    this.ConvToUpdate.push(idConv);
    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query(
        "DELETE FROM messages WHERE id = ?",
        [id],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
}
module.exports = Message;
