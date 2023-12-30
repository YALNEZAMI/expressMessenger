let fs = require("fs");
let { User } = require("../schemas/User.js");
let path = require("path");
const { log } = require("console");
class Zajl {
  constructor(id, id_user, nbrNotif, friends, friendReq, photo, notif) {
    this.id = id;
    this.id_user = id_user;
    this.nbrNotif = nbrNotif;
    this.friends = friends;
    this.friendReq = friendReq;
    this.photo = photo;
    this.notif = notif;
  }
  getNotif() {
    return this.notif;
  }
  setNotif(notif) {
    this.notif = notif;
  }
  getPhoto() {
    return this.photo;
  }
  setPhoto(photo) {
    this.photo = photo;
  }
  getFriendReq() {
    return this.friendReq;
  }
  setFriendReq(friendReq) {
    this.friendReq = friendReq;
  }
  getFriends() {
    return this.friends;
  }
  setFriends(friends) {
    this.friends = friends;
  }
  getId() {
    return this.id;
  }
  setId(id) {
    this.id = id;
  }
  getId_user() {
    return this.id_user;
  }
  setId_user(id_user) {
    this.getId_user = id_user;
  }
  getNbrMessageNonLu() {
    return this.nbrNotif;
  }
  setNbrMessageNonLu(nbrNotif) {
    this.nbrNotif = nbrNotif;
  }
  static async myProfilePhoto(req) {
    try {
      req.params.id_user = req.session.idUser;
      let myZajl = await Zajl.getZajlByIdUser(req);
      // console.log(myZajl);
      let photo = myZajl.photo;

      if (photo == "../imgOfConvs/profile.png") {
        return { photo: photo };
      }
      let absolutphoto = path.join(__dirname, "../Public/" + photo);
      // console.log(absolutphoto);
      try {
        // console.log(absolutphoto);
        fs.accessSync(absolutphoto);
        // console.log(photo);
        return { photo: photo };
      } catch (error) {
        return { photo: "./imgOfConvs/profile.png" };
      }
    } catch (error) {
      console.log(error);
    }
  }
  static logOut(req) {
    req.session.destroy();
    return { message: "logged out" };
  }
  static async getAllZajls(req) {
    try {
      let connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM zajls ", [], (err, result) => {
          if (err) {
            reject(err);
          } else {
            result.forEach((element) => {
              if (!fs.existsSync(element.photo)) {
                element.photo = "../imgOfConvs/profile.png";
              }
            });
          }
          resolve(result);
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  static deleteFile(oldpath) {
    try {
      let profileSplit = oldpath.split(`\\`);
      let verif = profileSplit[profileSplit.length - 1];
      if (verif != "profile.png") {
        fs.unlink(oldpath, (err) => {
          if (err) {
            console.log("delete file error");
          }
        });
      }
    } catch (error) {
      console.log("no such file");
    }
  }
  static async updatePhoto(req) {
    try {
      //get db connection
      let connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      //collect data
      let name = req.file.originalname;
      let pathTmp = req.file.path;
      let pathDb = "./imgOfZajls/" + req.params.id + name;
      let pathFromBackEnd = path.join(
        __dirname,
        "../Public/imgOfZajls/" + req.params.id + name
      );
      //rename the file to the new path
      fs.rename(pathTmp, pathFromBackEnd, async (err) => {
        if (err) {
          console.log(err);
        }
      });
      //get the old photo and delete it
      let oldPhoto = req.body.oldPhoto;
      let oldPath = oldPhoto.split("/");
      let oldName = oldPath[oldPath.length - 1];
      oldPhoto = path.join(__dirname, "../Public/imgOfZajls/" + oldName);
      Zajl.deleteFile(oldPhoto);
      //update the new photo
      let response = await new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET photo=? WHERE id_user=? ",
          [pathDb, req.params.id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  static async getZajlById(req) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "SELECT * FROM zajls WHERE id=?",
          [req.params.id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              result.forEach((element) => {
                if (!fs.existsSync(element.photo)) {
                  element.photo = "../imgOfConvs/profile.png";
                }
              });
              resolve(result);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async incrementNbrNotif(req, id) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET nbrNotif=nbrNotif + 1 WHERE id_user=?",
          [id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async decrementNbrNotif(req, id) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET nbrNotif=nbrNotif - 1 WHERE id_user=35 AND nbrNotif>0;",
          [id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async getnumberOfNotif(req) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "SELECT nbrNotif FROM zajls WHERE id_user=?",
          [req.session.idUser],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result[0]);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async getZajlByIdUser(req) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });

      return new Promise((resolve, reject) => {
        connection.query(
          "SELECT * FROM zajls WHERE id_user=?",
          [req.params.id_user],

          (err, result) => {
            if (err) {
              reject(err);
            } else {
              let resultFirst = result[0];
              let access = path.join(
                __dirname,
                "../Public/" + resultFirst.photo
              );
              // console.log(access);
              if (resultFirst.photo != null && resultFirst.photo != "") {
                try {
                  fs.accessSync(access);
                } catch (error) {
                  resultFirst.photo = "../imgOfConvs/profile.png";
                }
              } else {
                resultFirst.photo = "../imgOfConvs/profile.png";
              }
              resolve(resultFirst);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  static async getZajlByIdParam(req, id) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "SELECT * FROM zajls WHERE id=?",
          [id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async addZajl(req) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, conn) => {
          if (err) {
            reject(err);
          } else {
            resolve(conn);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "INSERT INTO zajls (id_user,nbrNotif,friends,friendReq,photo,notif) VALUES (?,?,?,?,?,?)",
          [
            req.body.id_user,
            req.body.nbrNotif,
            req.body.friends,
            req.body.friendReq,
            req.body.photo,
            req.body.notif,
          ],

          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async updateZajl(req) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, conn) => {
          if (err) {
            reject(err);
          } else {
            resolve(conn);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET id_user=?,nbrNotif=?,friends=?,friendReq=?,photo=?,notif=? WHERE id=?",
          [
            req.body.id_user,
            req.body.nbrNotif,
            req.body.friends,
            req.body.friendReq,
            req.body.photo,
            req.body.notif,
            req.params.id,
          ],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async deleteZajl(req) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "DELETE FROM zajls WHERE id=?",
          [req.params.id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async updateFriends(req, idZajl, friends) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET friends=? WHERE id=?",
          [friends, idZajl],
          (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async deleteFromALLFriendLists(req, id) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      //get all zajls
      let allzajls = await this.getAllZajls(req);
      let friends = "";
      //iterate over all zajls
      for (let zajl of allzajls) {
        //get friends of each zajl
        friends = zajl.friends;
        //split friends into array
        let tab = friends.split(",");
        //get index of id
        let index = tab.indexOf(id.toString());
        //if id exists in friends list
        if (index != -1) {
          //delete id from friends list
          tab.splice(index, 1);
          //join the array into string
          friends = tab.join(",");
          //update friends list
          await this.updateFriends(req, zajl.id, friends);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  static async deleteZajlByIdUser(req) {
    try {
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          } else {
            resolve(connection);
          }
        });
      });
      req.params.id_user = req.session.idUser;
      // delete the user from all friends lists
      await this.deleteFromALLFriendLists(req, req.params.id_user);
      //delete the photo of zajl
      let zajl = await this.getZajlByIdUser(req);
      let photo = zajl.photo;
      photo = path.join(__dirname, "../Public/" + photo);
      try {
        fs.unlinkSync(photo);
      } catch (error) {
        console.log("error delete photo of zajl");
      }
      //delete the zajl
      return new Promise((resolve, reject) => {
        connection.query(
          "DELETE FROM zajls WHERE id_user=?",
          [req.params.id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static sqlToObj(sqlZajl) {
    if (sqlZajl.length == 1) {
      return new Zajl(
        sqlZajl[0].id,
        sqlZajl[0].id_user,
        sqlZajl[0].nbrMessageNonLu
      );
    } else {
      let listZajl = [];
      sqlZajl.forEach((element) => {
        listZajl.push(
          new Zajl(element.id, element.id_user, element.nbrMessageNonLu)
        );
      });
      return listZajl;
    }
  }

  static async friendReq(req) {
    let operation = req.body.operation;
    if (operation == "addReq") {
      try {
        let sender = req.session.idUser;
        let reciever = req.body.friend;
        //increment the number of notification of the reciever
        await this.incrementNbrNotif(req, reciever);
        req.params.id_user = reciever;

        let zajlReciever = await this.getZajlByIdUser(req);
        let friendReq = zajlReciever.friendReq;
        if (friendReq == null || friendReq == "") {
          friendReq = sender;
        } else {
          let frTab = friendReq.split(",");
          if (!frTab.includes(sender.toString())) {
            friendReq = friendReq + "," + sender;
          }
        }
        const connection = await new Promise((resolve, reject) => {
          req.getConnection((err, connection) => {
            if (err) {
              reject(err);
            } else {
              resolve(connection);
            }
          });
        });
        return new Promise((resolve, reject) => {
          connection.query(
            "UPDATE zajls SET friendReq=? WHERE id_user=?",
            [friendReq, reciever],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                result.message = "friend request sent";
                resolve(result);
              }
            }
          );
        });
      } catch (error) {
        console.log(error);
      }
    } else if (operation == "cancelAddReq") {
      try {
        let sender = req.session.idUser;
        let reciever = req.body.reciever;
        await this.decrementNbrNotif(req, reciever);
        req.params.id_user = reciever;

        let zajlReciever = await this.getZajlByIdUser(req);
        let friendReq = zajlReciever.friendReq;
        let frTab = friendReq.split(",");
        frTab.forEach((element) => {
          if (element == sender.toString()) {
            frTab.splice(frTab.indexOf(element), 1);
          }
        });

        friendReq = frTab.join(",");
        const connection = await new Promise((resolve, reject) => {
          req.getConnection((err, connection) => {
            if (err) {
              reject(err);
            } else {
              resolve(connection);
            }
          });
        });
        return new Promise((resolve, reject) => {
          connection.query(
            "UPDATE zajls SET friendReq=? WHERE id_user=?",
            [friendReq, reciever],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                result.message = "friend request sent";
                resolve(result);
              }
            }
          );
        });
      } catch (error) {
        console.log(error);
      }
    } else if ((operation = "refuseFriendReq")) {
      try {
        let sender = req.body.sender;
        let reciever = req.session.idUser;
        await this.decrementNbrNotif(req, reciever);
        req.params.id_user = reciever;

        let zajlSender = await this.getZajlByIdUser(req);
        let friendReq = zajlSender.friendReq;
        let frTab = friendReq.split(",");
        frTab.forEach((element) => {
          if (element == sender.toString()) {
            frTab.splice(frTab.indexOf(element), 1);
          }
        });

        friendReq = frTab.join(",");
        const connection = await new Promise((resolve, reject) => {
          req.getConnection((err, connection) => {
            if (err) {
              reject(err);
            } else {
              resolve(connection);
            }
          });
        });
        return new Promise((resolve, reject) => {
          connection.query(
            "UPDATE zajls SET friendReq=? WHERE id_user=?",
            [friendReq, reciever],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                result.message = "friend request sent";
                resolve(result);
              }
            }
          );
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
  static async isMyFriend(req) {
    let sender = req.session.idUser;
    let reciever = req.body.reciever;
    req.params.id_user = sender;
    let zajlSender = await this.getZajlByIdUser(req);
    let friends = zajlSender.friends;
    if (friends == null || friends == "") {
      return false;
    } else {
      let frTab = friends.split(",");
      if (frTab.includes(reciever.toString())) {
        return true;
      } else {
        return false;
      }
    }
  }
  static async areFriends(req) {
    let id1 = req.params.id1;
    let id2 = req.params.id2;
    req.params.id_user = id1;
    let zajl1 = await this.getZajlByIdUser(req);
    let friends = zajl1.friends; //bug
    if (friends == null || friends == "") {
      return { areFriends: false };
    } else {
      let frTab = friends.split(",");
      if (frTab.includes(id2.toString())) {
        return { areFriends: true };
      } else {
        return { areFriends: false };
      }
    }
  }
  static async alreadySent(req) {
    try {
      let sender = req.params.sender;
      let reciever = req.params.reciever;
      req.params.id_user = reciever;
      let zajlReciever = await this.getZajlByIdUser(req);
      let friendReq = zajlReciever.friendReq; //bug
      if (friendReq == null || friendReq == "") {
        return { alreadySent: false };
      }
      let frTab = friendReq.split(",");
      if (frTab.includes(sender.toString())) {
        return { alreadySent: true };
      }
      return { alreadySent: false };
    } catch (error) {
      console.log(error);
    }
  }
  static async removeFriend(req) {
    try {
      //remove me from my friend list
      let idFriend = req.params.id;
      req.params.id_user = idFriend;
      let zajlFriend = await this.getZajlByIdUser(req);
      let friends = zajlFriend.friends;
      let frTab = friends.split(",");
      let sender = req.session.idUser;
      frTab.forEach((element) => {
        if (element == sender.toString()) {
          frTab.splice(frTab.indexOf(element), 1);
        }
      });
      friends = frTab.join(",");

      //remove my friend from my friend list
      let myid = req.session.idUser;
      req.params.id_user = myid;
      let Myzajl = await this.getZajlByIdUser(req);
      let myfriends = Myzajl.friends;
      let myfrTab = myfriends.split(",");
      myfrTab.forEach((element) => {
        if (element == idFriend.toString()) {
          myfrTab.splice(myfrTab.indexOf(element), 1);
        }
      });
      myfriends = myfrTab.join(",");

      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          }
          resolve(connection);
        });
      });
      await new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET friends=? WHERE id_user=?",
          [myfriends, myid],
          (err, result) => {
            if (err) {
              reject(err);
            }
            result.message = "friend removed";
            result.removed = 1;
            resolve(result);
          }
        );
      });

      return new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET friends=? WHERE id_user=?",
          [friends, idFriend],
          (err, result) => {
            if (err) {
              reject(err);
            }
            result.message = "friend removed";
            result.removed = 1;
            resolve(result);
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async acceptReq(req) {
    try {
      //collect ids
      let sender = req.params.sender;
      let reciever = req.session.idUser;
      //decrement nbrNotif of sender
      await this.decrementNbrNotif(req, reciever);
      //get the zajl of reciever (me)
      req.params.id_user = reciever;
      let zajlReciever = await this.getZajlByIdUser(req);
      //check if sender is already in my friends and if not add him
      let recieverFriends = zajlReciever.friends;
      let recieverFrTab = recieverFriends.split(",");
      if (!recieverFrTab.includes(sender.toString())) {
        if (recieverFriends == null || recieverFriends == "") {
          recieverFriends = sender;
        } else {
          recieverFriends = recieverFriends + "," + sender;
        }
      }
      //remove sender from friendReq
      let friendReq = zajlReciever.friendReq;
      let frTab = friendReq.split(",");
      frTab.forEach((element) => {
        if (element == sender.toString()) {
          frTab.splice(frTab.indexOf(element), 1);
        }
      });
      friendReq = frTab.join(",");

      //get the zajl of sender
      let zajlSender = await this.getZajlByIdUser(req);
      //check if reciever is already in sender friends
      let friends = zajlSender.friends;
      let senderFrTab = friends.split(",");
      if (!senderFrTab.includes(reciever.toString())) {
        if (friends == null || friends == "") {
          friends = reciever;
        } else {
          friends = friends + "," + reciever;
        }
      }
      //connection to db
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          }
          resolve(connection);
        });
      });
      //update sender friend list

      await new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET friends=? WHERE id_user=?",
          [friends, sender],
          (err, result) => {
            if (err) {
              reject(err);
            }
            result.message = "friend added";
            result.added = 1;
            resolve(result);
          }
        );
      });
      //update reciever friend list and friendReq
      return new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET friendReq=?,friends=? WHERE id_user=?",
          [friendReq, recieverFriends, reciever],
          (err, result) => {
            if (err) {
              reject(err);
            }
            result.message = "friend added";
            result.accepted = 1;
            resolve(result);
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async reinitNbrNotif(req) {
    try {
      let id = req.session.idUser;
      const connection = await new Promise((resolve, reject) => {
        req.getConnection((err, connection) => {
          if (err) {
            reject(err);
          }
          resolve(connection);
        });
      });
      return new Promise((resolve, reject) => {
        connection.query(
          "UPDATE zajls SET nbrNotif=? WHERE id_user=?",
          [0, id],
          (err, result) => {
            if (err) {
              reject(err);
            }
            result.message = "notifications reinitialized";
            result.reinitialized = 1;
            resolve(result);
          }
        );
      });
    } catch (error) {}
  }

  static async getFriendReqs(req) {
    try {
      //reinit nbrNotif
      await this.reinitNbrNotif(req);
      let id = req.session.idUser;
      req.params.id_user = id;
      let zajl = await this.getZajlByIdUser(req);
      let friendReq = zajl.friendReq;
      if (friendReq == null || friendReq == "") {
        return [];
      } else {
        let frTab = friendReq.split(",");
        let friendReqs = [];
        for (let i = 0; i < frTab.length; i++) {
          req.params.id = frTab[i];
          let user = await User.getUserById(req);
          friendReqs.push(user);
        }
        return friendReqs;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = {
  Zajl,
};
