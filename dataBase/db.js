let mysql = require("mysql");
let myconnection = require("express-myconnection");
// const options = {
//   host: "localhost",
//   user: "zhvskjjq_YASER",
//   password: "yaserAlnezami2000+",
//   database: "express",
//   port: 3306,
// };
const options = {
  host: "af0cabe747dd", // Replace with your container ID or container name
  user: "root", // The default user for MySQL
  password: "12345", // The password you set for the root user
  database: "express", // The name of your database
  port: 3306, // The default port for MySQL
};

let db = () => {
  let res = myconnection(mysql, options, "pool");
  return res;
};
module.exports = {
  db,
};
