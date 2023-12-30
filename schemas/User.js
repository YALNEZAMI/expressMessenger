class User {
  constructor(id, firstName, lastName, email, password) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
  }

  getId() {
    return this.id;
  }
  setId(id) {
    this.id = id;
  }
  getFirstname() {
    return this.firstName;
  }
  setFirstname(firstName) {
    this.firstName = firstName;
  }
  getLastName() {
    return this.lastName;
  }
  setLastName(lastName) {
    this.lastName = lastName;
  }
  getEmail() {
    return this.email;
  }
  setEmail(email) {
    this.email = email;
  }
  getPassword() {
    return this.password;
  }
  setPassword(password) {
    this.password = password;
  }

  static async getAllUsers(req) {
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
        connection.query("SELECT * FROM users", [], (err, result) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    } catch (err) {
      console.log(err);
      throw err; // Throw the error so it can be caught and handled higher up in the call stack.
    }
  }
  static async getUserByIdParam(req, id) {
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
        connection.query(
          "SELECT * FROM users WHERE id=?",
          [id],
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
  static async getUserById(req) {
    try {
      let id = req.params.id;
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
        connection.query(
          "SELECT * FROM users WHERE id=?",
          [id],
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
  static async getUserByEmail(req) {
    try {
      let email = req.body.email;
      email = email.toLowerCase();
      email = email.trim();
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
        connection.query(
          "SELECT * FROM users WHERE email=?",
          [email],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              if (result.length == 0) {
                // console.log(result);

                resolve(false);
              } else {
                // console.log(result);

                resolve(true);
              }
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  static async addUser(req) {
    try {
      let firstName = req.body.firstName;
      let lastName = req.body.lastName;
      let email = req.body.email;
      email = email.toLowerCase();
      email = email.trim();

      let password = req.body.password;
      let password2 = req.body.password2;
      if (await User.getUserByEmail(req)) {
        return { msg: "User already exists" };
      } else {
        if (password !== password2) {
          console.log("Passwords do not match");
          return { msg: "Passwords do not match" };
        } else {
          const connection = await new Promise((resolve, reject) => {
            req.getConnection((err, connection) => {
              if (err) {
                reject(err);
              } else {
                resolve(connection);
              }
            });
          });

          let returnUser = await new Promise((resolve, reject) => {
            connection.query(
              "INSERT INTO users (firstName,lastName,email,password) VALUES(?,?,?,?)",
              [firstName, lastName, email, password],
              (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              }
            );
          });
          // return returnUser;
          let idInserted = returnUser.insertId;
          // return { ID: idInserted };
          return new Promise((resolve, reject) => {
            connection.query(
              "INSERT INTO zajls (id_user,nbrNotif,friends,friendReq) VALUES (?,?,?,?)",
              [idInserted, 0, "", ""],
              (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  let ob = result;
                  ob.msg = "User added successfully, you can now sign in !";
                  ob.success = 1;
                  resolve(ob);
                }
              }
            );
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  static async updateUser(req) {
    try {
      let id = req.params.id;
      let firstName = req.body.firstName;
      let lastName = req.body.lastName;
      let email = req.body.email;
      let password = req.body.password;
      let passwordConfirm = req.body.passwordConfirm;
      if (password !== passwordConfirm) {
        return { msg: "Passwords do not match" };
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
          "UPDATE users SET firstName=?,lastName=?,email=?,password=? WHERE id=?",
          [firstName, lastName, email, password, id],
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              result.msg = "User updated successfully";
              resolve(result);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  static async deleteUser(req) {
    try {
      let id = req.params.id;

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
          "DELETE FROM users WHERE id=?",
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
  static sqlToObj(sqlUser) {
    if (sqlZajl.length == 1) {
      let user = new User(
        sqlUser[0].id,
        sqlUser[0].firstName,
        sqlUser[0].lastName,
        sqlUser[0].email,
        sqlUser[0].password
      );
      return user;
    } else {
      let users = [];
      sqlUser.forEach((user) => {
        users.push(
          new User(
            user.id,
            user.firstName,
            user.lastName,
            user.email,
            user.password
          )
        );
      });
      return users;
    }
  }
  static async login(req) {
    try {
      // console.log(User.getUserByEmail(req) + " 1");
      if ((await User.getUserByEmail(req)) == true) {
        // console.log("User already exists");
        let email = req.body.email;
        email = email.toLowerCase();
        email = email.trim();

        let password = req.body.password;
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
          connection.query(
            "SELECT * FROM users WHERE email=? AND password=?",
            [email, password],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                if (result.length == 1) {
                  resolve({ login: 1 });
                  req.session.idUser = result[0].id;
                } else {
                  resolve({ msg: "Wrong password !" });
                }
              }
            }
          );
        });
      } else {
        // console.log("User does not exist !");
        return { msg: "User does not exist !" };
      }
    } catch (error) {
      console.log(error);
    }
  }
  static async searchUser(req) {
    try {
      let all = await User.getAllUsers(req);
      let res = [];
      let searchKey = req.params.searchKey.toLowerCase();
      all.forEach((user) => {
        if (
          (user.firstName.toLowerCase().includes(searchKey) ||
            user.lastName.toLowerCase().includes(searchKey)) &&
          user.id != req.session.idUser
        ) {
          res.push(user);
        }
      });
      // console.log("search users : ", res);
      return res;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = { User };
