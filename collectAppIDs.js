const request = require("request");
const mysql = require("mysql");
const EventEmitter = require("events");

// Setting up event emitters
class GetSteamIdsEmitter extends EventEmitter {}
const getSteamIdsEmitter = new GetSteamIdsEmitter();

// Setting up MySQL
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

// Setting up variables
let amountOfEntries;
let currentEntry = 0;
let appArray;

// Requesting JSON file from SteamSpy
request({url: "https://steamspy.com/api.php?request=all", json: true}, (err, res, body) => {
    if (err) {
        return console.log(`Error while requesting JSON file form SteamSpy: ${err}`);
    }
    console.log(`Response code when requesting JSON file from SteamSpy: ${res.statusCode}`);

    // console.log(Object.entries(body).forEach(([key, val]) => {
    //     connection.query(`INSERT INTO app(steam_id) values(${key})`, (parserErr) => {
    //         console.log(parserErr);
    //     });
    // }));
    appArray = Object.entries(body);
    amountOfEntries = appArray.length;
    getSteamIdsEmitter.emit("nextInsert");
});

getSteamIdsEmitter.on("nextInsert", () => {
    insertIntoMySql();
});

function insertIntoMySql() {
    connection.query(`INSERT INTO app(steam_id) values(${appArray[currentEntry][0]})`, (insertErr) => {
        if (insertErr) {
            return console.log(`Error while inserting data into MySQL: ${insertErr}`);
        }
        console.log(currentEntry);
        currentEntry += 1;
        getSteamIdsEmitter.emit("nextInsert");
    });
}
