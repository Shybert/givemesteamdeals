const express = require("express");
const mysql = require("mysql");
const EventEmitter = require("events");
const async = require("async");

// Setting up express basics
const app = express();
app.set("view engine", "hbs");

// Setting up event emitters
class WebPagesEmitter extends EventEmitter {}
const webPagesEmitter = new WebPagesEmitter();

// Connecting to MySQL
const connection = mysql.createConnection({
    user: "root",
    password: "3oFkAlziyG",
    database: "gamesdb",
});
connection.connect((err) => {
    if (err) {
        console.log("Error when connecting to MySQL: " + err);
    }

    console.log("Connected to the MySQL server");
});

// Serving js
app.get("/js/:file", (req, res) => {
    res.sendFile(`/Webpages/js/${req.params.file}`);
});

app.get("/price_history/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);

    async.waterfall([
        (callback) => {
            callback(null, id);
        },
        getPriceHistoryData,
    ], (err, data) => {
        console.log(data);
        res.send(data);
    });
});

app.get("/id/:id", (req, res) => {
    const id = req.params.id;
    console.log(`Request: ${req}`);

    async.waterfall([
        (callback) => {
            callback(null, id);
        },
        getAppInfo,
        getDevPub,
        getDevPub,
    ], (err, data) => {
        if (err) {
            return console.log(err);
        }
        if (data) {
            console.log("Data returned from waterfall, rendering webpage");
            console.log(data);
            res.render("appPage", data);
        }
    });
});

// SETUP FALLBACK
// FALLBACK
// GOES
// HERE

// Functions
function getAppInfo(id, callback) {
    connection.query(`SELECT * FROM app WHERE steam_id = ${id}`, (err, results) => {
        if (err) {
            callback(err);
        }
        if (results) {
            const data = results[0];
            console.log(`\n--- STEAM ID #${id} ---`);
            console.log("Data found");

            // Appending the metacritic link base
            if (data.metacritic_link !== null) {
                console.log("Appending Metacritic link");
                data.metacritic_link = `http://www.metacritic.com${data.metacritic_link}`;
            }

            console.log("Formatting time from unix time");
            // Multipling date by 1000 to get milliseconds
            const releaseDate = new Date(data.release_date * 1000);
            data.release_date = releaseDate.toISOString().slice(0, 10);

            callback(null, id, data, "developer");
        }
    });
}

function getDevPub(id, data, devOrPub, callback) {
    const dataObj = data;
    connection.query(`SELECT company_company_id FROM ${devOrPub} WHERE app_steam_id = ${id}`, (err, results) => {
        if (err) {
            callback(err);
        }
        if (results) {
            console.log(`${devOrPub}s found`);

            // Get the developer names
            connection.query(`SELECT name FROM company WHERE company_id = ${results[0].company_company_id}`, (nameErr, nameResults) => {
                if (nameErr) {
                    callback(nameErr);
                }
                if (nameResults) {
                    // Append to the data object
                    if (devOrPub === "developer") {
                        console.log("Appending developers to data object, then finding publishers");
                        dataObj.developers = nameResults[0].name;
                        callback(null, id, dataObj, "publisher");
                    } else {
                        console.log("Appending publishers to data object");
                        dataObj.publishers = nameResults[0].name;
                        callback(null, dataObj);
                    }
                }
            });
        }
    });
}

function getPriceHistoryData(id, callback) {
    console.log("--- Getting Price History Data ---");
    connection.query(`SELECT * FROM price_history WHERE app_steam_id = ${id}`, (err, results) => {
        if (err) {
            return callback(err);
        }
        if (results) {
            console.log(results);
            callback(null, results);
        }
    });
}

// Starting server
app.listen(3000);
console.log("Listening on port 3000");
