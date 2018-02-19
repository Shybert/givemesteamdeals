const express = require("express");
const path = require("path");
const hbs = require("hbs");
const async = require("async");
const mysql = require("mysql");

// Interesting IDs: 10680

// Setting up basics
const app = express();
app.set("port", 3000);
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, "public")));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// Connecting to MySQL
const connection = mysql.createConnection({
    user: "root",
    password: "nSPemHJ5Hc",
    database: "gamesdb",
});
connection.connect((err) => {
    if (err) {
        return console.log("Error when connecting to MySQL: " + err);
    }
    console.log("Connected to the MySQL server");
});

// App page requested
app.get("/id/:id", (req, res) => {
    const id = req.params.id;
    console.log(`\n--- App page with ID #${id} requested ---`);

    async.waterfall([
        (callback) => {
            callback(null, id);
        },
        genericData,
        getDevPub,
        getDevPub,
    ], (err, data) => {
        if (err) {
            return console.log(err);
        }
        if (data) {
            console.log("\n");
            res.render("appPage", data);
        }
    });
});

// Rating data requested
app.get("/ratingdata/:id", (req, res) => {
    const id = req.params.id;
    console.log(`Rating data for game with ID #${id} requested`);

    connection.query(`SELECT steam_rating_text, steam_rating_percent, steam_rating_positive, steam_rating_negative FROM app WHERE steam_id = ${id}`, (err, results) => {
        if (err) {
            return console.log(`Error while querying for rating data: ${err}`);
        }
        if (results) {
            const data = results[0];
            console.log(`Results from rating data request: ${JSON.stringify(data)}`);

            // Check if any needed rating params are missing, if so inform client
            if (data.steam_rating_percent === null || data.steam_rating_positive === null || data.steam_rating_negative === null) {
                console.log("Missing rating data");
                res.send("noRating");
            } else {
                res.send(data);
            }
        }
    });
});

// Price history data requested
app.get("/pricedata/:id", (req, res) => {
    const id = req.params.id;
    const price = {};
    console.log(`Price data requested for ID #${id}`);

    connection.query(`SELECT * FROM price_history WHERE app_steam_id = ${id}`, (err, results) => {
        if (err) {
            return console.log(`Error while querying for price history data: ${err}`);
        }
        if (results) {
            console.log(`Results from price history data request: ${JSON.stringify(results[0])}`);
            price.priceHistory = results;
            res.send(price);
        }
    });
});

// Homepage requested
app.get("/", (req, res) => {
    console.log("\nMain page requested");
    res.render("index");
});

// No webpages found, 404 error
app.use((req, res) => {
    console.log("\n404 error encountered");
    res.status(404);
    res.render("404");
});

app.listen(app.get("port"), () => {
    console.log(`Started server, listening on port ${app.get("port")}`);
});

// Functions
function genericData(id, callback) {
    console.log("Fetching generic data");
    connection.query(`SELECT * FROM app WHERE steam_id = ${id}`, (err, results) => {
        if (err) {
            return callback(err);
        }
        if (results) {
            const data = results[0];
            console.log(`Results from querying generic data: ${JSON.stringify(data)}`);

            // Appending metacritic link base, if there is one
            if (data.metacritic_link !== null) {
                console.log("Metacritic link exists, appending base");
                data.metacritic_link = `http://www.metacritic.com${data.metacritic_link}`;
            }


            callback(null, id, data, "developer");
        }
    });
}

function getDevPub(id, data, devPub, callback) {
    const dataObj = data;
    console.log(`Fetching list of ${devPub} IDs`);
    connection.query(`SELECT company_company_id FROM ${devPub} WHERE app_steam_id = ${id}`, (err, results) => {
        if (err) {
            return callback(err);
        }
        if (results) {
            if (results.length === 0) {
                // No developer/publisher, skip
                if (devPub === "developer") {
                    console.log("No developer, skipping");
                    callback(null, id, dataObj, "publisher");
                } else if (devPub === "publisher") {
                    console.log("No publisher, skipping");
                    callback(null, dataObj);
                }
            } else {
                const devPubId = results[0].company_company_id;
                console.log(`Developer found: ${JSON.stringify(results)}`);
                connection.query(`SELECT name FROM company WHERE company_id = ${devPubId}`, (nameErr, nameResults) => {
                    if (nameErr) {
                        return callback(err);
                    }
                    if (nameResults) {
                        console.log(`Fetched ${devPub} name`);
                        if (devPub === "developer") {
                            // devPub is developer, so fetch publisher next
                            dataObj.developers = nameResults[0].name;
                            callback(null, id, dataObj, "publisher");
                        } else if (devPub === "publisher") {
                            // devPub is publisher, so finish the waterfall
                            dataObj.publishers = nameResults[0].name;
                            callback(null, dataObj);
                        }
                    }
                });
            }
        }
    });
}
