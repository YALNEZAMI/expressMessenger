let { User } = require("../schemas/User");
let { Zajl } = require("../schemas/Zajl");
let Message = require("../schemas/Message");
let path = require("path");
let fs = require("fs");
class Conv {
  constructor(id, photo, nom, dernierMessage, messageNonLu, participants) {
    this.id = id;
    this.photo = photo;
    this.nom = nom;
    this.dernierMessage = dernierMessage;
    this.messageNonLu = messageNonLu;
    this.participants = participants;
  }
  getParticipants() {
    return this.participants;
  }
  setParticipants(participants) {
    this.participants = participants;
  }
  getId() {
    return this.id;
  }
  getPhoto() {
    return this.photo;
  }
  getNom() {
    return this.nom;
  }
  getDernierMessage() {
    return this.dernierMessage;
  }
  getMessageNonLu() {
    return this.messageNonLu;
  }
  setId(id) {
    this.id = id;
  }
  setPhoto(photo) {
    this.photo = photo;
  }
  setNom(nom) {
    this.nom = nom;
  }
  setDernierMessage(dernierMessage) {
    this.dernierMessage = dernierMessage;
  }
  setMessageNonLu(messageNonLu) {
    this.MessageNonLu = messageNonLu;
  }
  static async getConvs(req) {
    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    let result = await new Promise((resolve, reject) => {
      connection.query("SELECT * FROM Conv", (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    for (let i = 0; i < result.length; i++) {
      let idConv = result[i].id;
      let lastMessage = await Conv.getLastMessage(req, idConv); // Assuming Conv.getLastMessage is an asynchronous function
      result[i].dernierMessage = lastMessage;
    }

    return result;
  }
  //test to delet
  static async getLastMessage(req, idConv) {
    let allMessage = await Conv.getMessagesOfConv(req, idConv);
    let lastMessage = allMessage[allMessage.length - 1];
    return lastMessage;
  }
  //test to delet
  static async getMessagesOfConv(req, idConv) {
    let allMessage = await Message.getMessages(req);
    let messagesOfConv = [];
    allMessage.forEach((message) => {
      if (message.id_Conv == idConv) {
        messagesOfConv.push(message);
      }
    });
    return messagesOfConv;
  }
  static async quiteConv(req) {
    try {
      //collect data
      let idUser = req.session.idUser;
      let idConv = req.body.idConv;
      //get conv
      let conv = await Conv.getConvByIdParam(req, idConv);
      //delete the user from the conv
      let participants = conv.participants;
      let tabParticipants = participants.split(",");
      let index = tabParticipants.indexOf(idUser.toString());
      tabParticipants.splice(index, 1);
      participants = tabParticipants.join(",");
      //if the conv is empty delete it
      if (participants.trim() === "") {
        req.params.id = idConv;
        let photo = conv.photo;
        try {
          fs.unlinkSync(path.join(__dirname, "../public", photo));
        } catch (error) {
          console.log("no such photo ");
        }
        await Conv.deleteConv(req);
        //dd
      }
      let connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) reject(err);
          resolve(connection);
        });
      });
      let result = await new Promise((resolve, reject) => {
        connection.query(
          "UPDATE Conv SET participants=? WHERE id=?",
          [participants, idConv],
          (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
          }
        );
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  static async getMyConvs(req) {
    let id = req.session.idUser;
    let allConvs = await Conv.getConvs(req);
    let myConvs = [];
    // allConvs.forEach(async (conv) => {
    for (let conv of allConvs) {
      let tabParticipants = conv.participants.split(",");
      //chack if the user is in the conv
      if (tabParticipants.includes(id.toString())) {
        //case of conv with 2 participants
        if (tabParticipants.length == 2) {
          //am the first participant
          if (tabParticipants[0] == id.toString()) {
            //chack if the name is set or not if not set it
            if (conv.nom == null || conv.nom == "") {
              let user = await User.getUserByIdParam(req, tabParticipants[1]);
              conv.nom = user.firstName + " " + user.lastName;
            }
            //chack if the photo is set or not if not set it
            if (conv.photo == null || conv.photo == "") {
              req.params.id_user = tabParticipants[1];
              let zajl = await Zajl.getZajlByIdUser(req);
              if (zajl.photo == null || zajl.photo == "") {
                conv.photo = "./imgOfConvs/profile.png";
              } else {
                conv.photo = zajl.photo;
              }
            }
            //am the second participant
          } else {
            //chack if the name is set or not if not set it
            if (conv.nom == null || conv.nom == "") {
              let user = await User.getUserByIdParam(req, tabParticipants[0]);
              conv.nom = user.firstName + " " + user.lastName;
            }
            //chack if the photo is set or not if not set it
            if (conv.photo == null || conv.photo == "") {
              req.params.id_user = tabParticipants[0];
              let zajl = await Zajl.getZajlByIdUser(req);
              conv.photo = zajl.photo;
            }
          }
          //case of conv with less than 2 participants
        } else if (tabParticipants.length < 2) {
          //chack if the name is set or not if not set it
          if (conv.nom == null || conv.nom == "") {
            let user = await User.getUserByIdParam(req, tabParticipants[0]);
            conv.nom = user.firstName + " " + user.lastName;
          }
          //chack if the photo is set or not if not set it
          if (conv.photo == null || conv.photo == "") {
            req.params.id_user = tabParticipants[0];
            let zajl = await Zajl.getZajlByIdUser(req);
            conv.photo = zajl.photo;
          }
          //case of conv with more than 2 participants
        } else {
          conv.nom = "Groupe to rename";
          conv.photo = "./imgOfConvs/group.png";
        }
        //chack if the photo file exist
        let mypath = path.join(__dirname, "../Public/" + conv.photo);
        try {
          fs.accessSync(mypath);
        } catch (error) {
          conv.photo = "./imgOfConvs/profile.png";
        }

        //push the conv after the modifications
        myConvs.push(conv);
      }
    }

    return myConvs;
  }
  static async nameAndPhoto(req) {
    try {
      let idConv = req.session.idConv;
      let conv = await Conv.getConvByIdParam(req, idConv);

      let tabParticipants = conv.participants.split(",");
      let id = req.session.idUser;
      //case of conv with 2 participants
      if (tabParticipants.length == 2) {
        //am the first participant
        if (tabParticipants[0] == id.toString()) {
          //chack if the name is set or not if not set it
          if (conv.nom == null || conv.nom == "") {
            let user = await User.getUserByIdParam(req, tabParticipants[1]);
            conv.nom = user.firstName + " " + user.lastName;
          }
          //chack if the photo is set or not if not set it
          if (conv.photo == null || conv.photo == "") {
            req.params.id_user = tabParticipants[1];
            let zajl = await Zajl.getZajlByIdUser(req);
            conv.photo = zajl.photo;
          }
          //am the second participant
        } else {
          //chack if the name is set or not if not set it
          if (conv.nom == null || conv.nom == "") {
            let user = await User.getUserByIdParam(req, tabParticipants[0]);
            conv.nom = user.firstName + " " + user.lastName;
          }
          //chack if the photo is set or not if not set it
          if (conv.photo == null || conv.photo == "") {
            req.params.id_user = tabParticipants[0];
            let zajl = await Zajl.getZajlByIdUser(req);
            conv.photo = zajl.photo;
          }
        }
        //case of conv with less than 2 participants
      } else if (tabParticipants.length < 2) {
        //chack if the name is set or not if not set it
        if (conv.nom == null || conv.nom == "") {
          let user = await User.getUserByIdParam(req, tabParticipants[0]);
          conv.nom = user.firstName + " " + user.lastName;
        }
        //chack if the photo is set or not if not set it
        if (conv.photo == null || conv.photo == "") {
          req.params.id_user = tabParticipants[0];
          let zajl = await Zajl.getZajlByIdUser(req);
          conv.photo = zajl.photo;
        }
        //case of conv with more than 2 participants
      } else {
        conv.nom = "Groupe to rename";
      }
      //chack if the photo file exist
      let mypath = path.join(__dirname, "../Public/" + conv.photo);
      if (conv.photo != null && conv.photo != "" && conv.photo != undefined) {
        try {
          fs.accessSync(mypath);
        } catch (error) {
          conv.photo = "./imgOfConvs/profile.png";
        }
      }

      let res = {
        name: conv.nom,
        photo: conv.photo,
        idConv: conv.id,
      };
      return res;
    } catch (error) {
      console.log(error);
    }
  }
  static async searchConv(req) {
    try {
      let id = req.session.idUser;
      let all = await Conv.getMyConvs(req);
      let search = req.params.searchKey;
      search = search.toLowerCase();
      search = search.trim();
      let myConvs = [];
      all.forEach(async (conv) => {
        let nom = conv.nom;
        nom = nom.toLowerCase();
        nom = nom.trim();
        if (nom.includes(search)) {
          myConvs.push(conv);
        }
        // let tabParticipants = conv.participants.split(",");
        // if (id) {
        //   // if (tabParticipants.includes(req.session.idUser.toString())) {
        //   //   if (conv.nom.toLowerCase().trim().includes(search)) {
        //   //     myConvs.push(conv);
        //   //   }
        //   // }
        //   if (tabParticipants.length == 2) {
        //     if (tabParticipants[0] == id.toString()) {
        //       let user = await User.getUserByIdParam(req, tabParticipants[1]);
        //       conv.nom = user.firstName + " " + user.lastName;
        //       req.params.id_user = tabParticipants[1];
        //       let zajl = await Zajl.getZajlByIdUser(req);
        //       conv.photo = zajl.photo;
        //     } else {
        //       let user = await User.getUserByIdParam(req, tabParticipants[0]);
        //       conv.nom = user.firstName + " " + user.lastName;
        //       req.params.id_user = tabParticipants[0];
        //       let zajl = await Zajl.getZajlByIdUser(req);
        //       conv.photo = zajl.photo;
        //     }
        //   } else if (tabParticipants.length < 2) {
        //     let user = await User.getUserByIdParam(req, tabParticipants[0]);
        //     conv.nom = user.firstName + " " + user.lastName;
        //     req.params.id_user = tabParticipants[0];
        //     let zajl = await Zajl.getZajlByIdUser(req);
        //     conv.photo = zajl.photo;
        //   } else {
        //     conv.nom = "Groupe to rename";
        //   }
        // }
      });

      return myConvs;
    } catch (error) {
      console.log(error);
    }
  }
  static async addConv(req) {
    let photo = req.body.photo;
    let nom = req.body.nom;
    let dernierMessage = req.body.dernierMessage;
    let messageNonLu = req.body.messageNonLu;
    let participants = req.body.participants;
    participants = participants.join(",");

    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO Conv (photo,nom,dernierMessage,messageNonLu,participants,deletedMsg) VALUES (?,?,?,?,?,?)",
        [photo, nom, dernierMessage, messageNonLu, participants, ""],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
  static async updateDeletedMsg(req) {
    let id = req.body.idConv;
    let idMsg = req.body.idMsg;
    let conv = await Conv.getConvByIdParam(req, id);
    let deletedMsg = conv.deletedMsg;
    if (deletedMsg == "") {
      deletedMsg = idMsg;
    } else {
      deletedMsg = deletedMsg + "," + idMsg;
    }
    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE Conv SET deletedMsg=? WHERE id=?",
        [deletedMsg, id],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
  static async updateToDelete(req) {
    let id = req.params.id;
    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    let deletedMsg = await new Promise((resolve, reject) => {
      connection.query(
        "SELECT deletedMsg FROM conv WHERE id=?",
        [id],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });

    return deletedMsg[0];
  }
  static async getConvById(req) {
    let id = req.params.id;

    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM Conv WHERE id=?", [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
  static async getConvByIdParam(req, id) {
    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM Conv WHERE id=?", [id], (err, result) => {
        if (err) reject(err);
        resolve(result[0]);
      });
    });
  }
  static async updateConv(req) {
    let id = req.params.id;
    let photo = req.body.photo;
    let nom = req.body.nom;
    let dernierMessage = req.body.dernierMessage;
    let messageNonLu = req.body.messageNonLu;
    let participants = req.body.participants;
    participants = participants.join(",");

    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE Conv SET photo=?,nom=?,dernierMessage=?,messageNonLu=?,participants=? WHERE id=?",
        [photo, nom, dernierMessage, messageNonLu, participants, id],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
  static async getOurConvId(req) {
    try {
      //the tow id of the users
      let id1 = req.params.id1;
      let id2 = req.params.id2;
      //get all the convs
      let all = await Conv.getConvs(req);
      //iterate over the convs
      for (let conv of all) {
        //split the participants
        let tabParticipants = conv.participants.split(",");
        //if the conv is a private conv
        if (tabParticipants.length == 2) {
          //if the conv is between the two users
          if (
            tabParticipants[0] == id1.toString() &&
            tabParticipants[1] == id2.toString()
          ) {
            //return the id of the conv
            return { idConv: conv.id };
            //if the conv is between the two users but in the other way
          } else if (
            tabParticipants[0] == id2.toString() &&
            tabParticipants[1] == id1.toString()
          ) {
            //return the id of the conv
            return { idConv: conv.id };
          }
        }
      }

      req.body.photo = "";
      req.body.nom = "";
      req.body.dernierMessage = "";
      req.body.messageNonLu = 0;
      req.body.participants = [id1, id2];
      let add = await this.addConv(req);
      let idNewConv = add.insertId;
      req.session.idConv = idNewConv;
      return { idConv: idNewConv };
    } catch (error) {
      console.log(error);
    }
  }
  static fileExist(path) {
    try {
      fs.accessSync(path, fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }
  static async updateNameAndPhoto(req) {
    try {
      let date = new Date().getFullYear();
      let idConv = req.params.id;
      let nom = req.body.nom;
      let destinationPath;
      let connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) reject(err);
          resolve(connection);
        });
      });
      if (req.file) {
        let photoName = req.file.originalname;
        let photoNameSplitted = photoName.split(".");
        let ext = "." + photoNameSplitted[photoNameSplitted.length - 1];

        let sourcePath = req.file.path;
        destinationPath = path.join(
          __dirname,
          "../public/imgOfConvs/" + idConv + "-" + date + ext
        );
        let pathInDb = "./imgOfConvs/" + idConv + "-" + date + ext;
        fs.rename(sourcePath, destinationPath, (err) => {
          if (err) {
            console.error("Error moving file:", err);
          } else {
            console.log("File moved successfully.");
          }
        });
        let oldPhoto = req.body.oldPhoto;
        oldPhoto = path.join(__dirname, "../Public/" + oldPhoto);
        if (
          oldPhoto != "" &&
          oldPhoto != undefined &&
          oldPhoto != null &&
          oldPhoto != "./imgOfConvs/profile.png"
        ) {
          try {
            fs.unlinkSync(oldPhoto, (err) => {
              if (err) {
                console.error("Error removing file:", err);
              } else {
                console.log("File removed successfully.");
              }
            });
            console.log("file removed");
          } catch (error) {
            console.log("file not found");
          }
        }

        return new Promise((resolve, reject) => {
          connection.query(
            "UPDATE conv SET nom=?,photo=? WHERE id=?",
            [nom, pathInDb, idConv],
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          );
        });
      }

      return new Promise((resolve, reject) => {
        connection.query(
          "UPDATE conv SET nom=? WHERE id=?",
          [nom, idConv],
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

  static async deleteConv(req) {
    let id = req.params.id;

    let connection = await new Promise((resolve, reject) => {
      req.getConnection((err, connection) => {
        if (err) reject(err);
        resolve(connection);
      });
    });
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM Conv WHERE id=?", [id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
  static async quiteFromAll(req) {
    try {
      let all = await Conv.getConvs(req);
      for (let conv of all) {
        req.body.idConv = conv.id;
        await this.quiteConv(req);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = {
  ConvSchemas: Conv,
};
