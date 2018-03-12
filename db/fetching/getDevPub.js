const mysql = require("mysql");
const request = require("request");
const EventEmitter = require("events");

// Connecting to MySQL
const connection = mysql.createConnection({
    user: "root",
    password: "nSPemHJ5Hc",
    database: "gamesdb",
});
connection.connect((err) => {
    if (err) {
        return console.log(`Error while connecting to MySQL: ${err}`);
    }
    console.log("Connected to the MySQL server.");
});

// Setting up event emitter
class DevOrPubEmitter extends EventEmitter {}
const devOrPubEmitter = new DevOrPubEmitter();
