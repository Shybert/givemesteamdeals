const mysql = require("mysql");
const EventEmitter = require("events");
const request = require("request");

// Connecting to MySQL
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

// Setting up event emitter
class CheapSharkEmitter extends EventEmitter {}
const cheapSharkEmitter = new CheapSharkEmitter();

// Setting up variables
let idsArray;
const baseLink = "http://www.cheapshark.com/api/1.0/deals?storeID=1&steamAppID=";

connection.query(`SELECT steam_id FROM app`, (err, results) => {
    if (err) {
        return console.log(`Error while selecting steam_ids from table app: ${err}`);
    }
    if (results) {
        console.log(`Amount of results: ${results.length}`);
        idsArray = results;
        cheapSharkEmitter.emit("results");
    }
});

cheapSharkEmitter.on("results", () => {
    getCheapSharkData();
});

function getCheapSharkData() {
    let properLink = baseLink;
    for (let i = 0; i < 60; i += 1) {
        if (i === 59) {
            properLink += `${idsArray[i].steam_id}`;
            // console.log(properLink);
            cheapSharkEmitter.emit("link", (properLink));
        } else {
            properLink += `${idsArray[i].steam_id},`;
        }
        console.log(idsArray[i].steam_id);
    }
}

cheapSharkEmitter.on("link", (link) => {
    console.log(`Emitted link is: ${link}`);

    // Requesting the JSON file
    request({url: link, json: true}, (err, res, body) => {
        if (err) {
            return console.log(`Error while requesting LINK(${link}) from CheapShark: ${err}`);
        }
        if (res) {
            console.log(`Response code from CheapShark: ${res.statusCode}`);

            const appArray = Object.entries(body);
            const currentGame = appArray[6][1];
            console.log(currentGame);

            // Inserting the basic information from CheapShark
            connection.query(`  UPDATE app SET
                                internal_name = ${connection.escape(currentGame.internalName)},
                                title = ${connection.escape(currentGame.title)},
                                steam_rating_text = ${connection.escape(currentGame.steamRatingText)},
                                steam_rating_percent = ${connection.escape(currentGame.steamRatingPercent)},
                                release_date = ${connection.escape(currentGame.releaseDate)},
                                last_change = ${connection.escape(currentGame.lastChange)},
                                metacritic_link = ${connection.escape(currentGame.metacriticLink)},
                                thumbnail = ${connection.escape(currentGame.thumb)} WHERE steam_id = ${connection.escape(currentGame.steamAppID)}`, (updateErr, updateResults) => {
                if (updateErr) {
                    return console.log(`Error while updating table with STEAM_ID(${currentGame.steamAppID}): ${updateErr}`);
                }
                if (updateResults) {
                    console.log(currentGame.steamAppID);
                }
            });
        }
    });
});
