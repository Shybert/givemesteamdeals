const request = require("request");
const mysql = require("mysql");
const EventEmitter = require("events");

// Setting up event emitters
class GetSteamIdsEmitter extends EventEmitter {}
const getSteamIdsEmitter = new GetSteamIdsEmitter();

// Setting up MySQL
const connection = mysql.createConnection({
    user: "root",
    password: "3oFkAlziyG",
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
console.log("Requesting SteamSpy JSON file");
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
    if (currentEntry < amountOfEntries) {
        insertIntoMySql();
    } else {
        console.log("Finished collecting Steam IDs");
    }
});

function insertIntoMySql() {
    const gameInfoObj = appArray[currentEntry][1];
    connection.query(`  INSERT INTO app(steam_id, steam_rating_positive, steam_rating_negative, owners, players_forever, players_2weeks, average_forever, average_2weeks, median_forever, median_2weeks) values(
                        ${appArray[currentEntry][0]},
                        ${gameInfoObj.positive},
                        ${gameInfoObj.negative},
                        ${gameInfoObj.owners},
                        ${gameInfoObj.players_forever},
                        ${gameInfoObj.players_2weeks},
                        ${gameInfoObj.average_forever},
                        ${gameInfoObj.average_2weeks},
                        ${gameInfoObj.median_forever},
                        ${gameInfoObj.median_2weeks})`, (insertErr, results, fields) => {
        if (insertErr) {
            console.log(`Error while inserting data into MySQL: ${insertErr}`);
            getSteamIdsEmitter.emit("nextInsert");
            return;
        }
        if (results) {
            console.log(currentEntry);
            currentEntry += 1;
            getSteamIdsEmitter.emit("nextInsert");
        }
    });
}
