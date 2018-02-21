const mysql = require("mysql");

// MySQL connection, usable throughout the app
const connection = mysql.createConnection({
    user: "root",
    password: "nSPemHJ5Hc",
    database: "gamesdb",
});
connection.connect((err) => {
    if (err) {
        return console.error(`Error when connecting to MySQL: ${err}`);
    }
    console.log("Connected to the MySQL server");
});
module.exports.connection = connection;

module.exports.getBasicData = (id, callback) => {
    console.log(`ID#${id}: Getting basic data`);

    connection.query(`SELECT * FROM app WHERE steam_id = ${id}`, (err, results) => {
        if (err) {
            return callback(err);
        }
        // Tell about no data found?
        console.log(`ID#${id}: Found data`);
        return callback(null, results[0]);
    });
};

module.exports.getDevOrPub = (id, devOrPub, callback) => {
    // Checking if devOrPub is valid
    if (devOrPub !== "developer" || devOrPub !== "publisher") {
        Error("Invalid value, should be either 'developer' or 'publisher'");
        // return callback("ERR: ")
    }

    console.log(`ID#${id}: Getting ${devOrPub}`);

    connection.query(`SELECT * FROM ${devOrPub} WHERE app_steam_id = ${id}`, (err, results) => {
        if (err) {
            return callback(err);
        }
        console.log(`ID#${id}: Fetched ${devOrPub} IDs`);
        return callback(null, results);
    });
};
