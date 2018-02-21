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
    password: "3oFkAlziyG",
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
            console.log(data); // temp
            console.log("\n");
            res.render("appPage", data);
        }
    });
});

// Search page requested
app.get("/search", (req, res) => {
    console.log(`\n--- Search page requested ---`);
    const query = req.query.searchquery;
    console.log(`Search query: ${query}`);

    // Search through db
    connection.query(`SELECT * FROM app WHERE title REGEXP '${query}'`, (err, results) => {
        if (err) {
            res.render("search", {nothing: "No games found, sorry!"});
            return console.log(`Error while finding info for the search: ${err}`);
        }
        if (results) {
            const data = results;
            console.log(data);

            // If no games found
            if (data.length === 0) {
                return res.render("search", {nothing: "No games found, sorry!"});
            }

            // Max length to return is 50
            if (data.length > 50) {
                data.length = 50;
            }

            async.each(data, getPriceSaleInfo, (priceErr) => {
                if (priceErr) {
                    return console.log(`Error while querying for price for search: ${err}`);
                }
                console.log(`Finished async each`);
                console.log(data);

                const obj = {};
                obj.data = results;
                res.render("search", obj);
            });
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

    // Getting 16 random deals
    connection.query(`SELECT * FROM app WHERE on_sale = 1`, (err, results) => {
        if (err) {
            return console.log(`Error while getting list of games currently on sale: ${err}`);
        }
        if (results) {
            console.log(`Fetched games currently on sale, randomizing array`);
            shuffleArray(results, (array) => {
                console.log(`Randomized array, limiting to 16 and getting price/sale info`);
                const data = array;
                data.length = 16;

                async.each(data, getPriceSaleInfo, (priceErr) => {
                    if (priceErr) {
                        return console.log(`Error while getting price and sale info for random deals: ${priceErr}`);
                    }
                    console.log(`Finished getting price/sale info`);
                    // console.log(data);

                    const obj = {};
                    obj.data = results;
                    res.render("index", obj);
                });
            });
        }
    });
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

            // Convert release_date to an actual date, if it isn't 0
            if (data.release_date === "0") {
                data.release_date = null;
            } else if (data.release_date !== null) {
                console.log(`Release date: ${data.release_date}`);
                let release = new Date(data.release_date * 1000);
                release = release.toISOString().substr(0, 10);
                data.release_date = release;
            }

            // Get price info now
            console.log(`Querying price info`);
            getPriceSaleInfo(data, (priceErr, dataObj) => {
                if (priceErr) {
                    return callback(priceErr);
                }
                if (dataObj) {
                    callback(null, id, dataObj, "developer");
                }
            });
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

function getPriceSaleInfo(data, callback) {
    console.log(`Getting price and sale info for ${data.steam_id}`);
    const dataObj = data;
    connection.query(`SELECT * FROM price_history WHERE app_steam_id = ${dataObj.steam_id} AND end_date IS NULL`, (priceErr, priceResults) => {
        if (priceErr) {
            return callback(priceErr);
        }
        if (priceResults) {
            console.log(`Price info found`);
            dataObj.price_history = priceResults[0];

            // Check if on sale
            if (dataObj.on_sale === 1) {
                console.log("On sale");
                // Game is on sale, get sale info
                console.log(`Querying for sale info`);
                connection.query(`SELECT * FROM sale_history WHERE app_steam_id = ${dataObj.steam_id} AND end_date IS NULL`, (saleErr, saleResults) => {
                    if (saleErr) {
                        return callback(saleErr);
                    }
                    if (saleResults) {
                        console.log("Sale info found");
                        dataObj.sale_history = saleResults[0];

                        const price = dataObj.price_history.price;
                        const salePrice = dataObj.sale_history.price;
                        dataObj.discount_percent = Math.round(((price - salePrice) / price) * 100);

                        callback(null, dataObj);
                    }
                });
            } else {
                console.log("Not on sale");
                // Game isn't on sale, set on_sale to zero for the template
                dataObj.on_sale = null;
                callback(null, dataObj);
            }
        }
    });
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array, callback) {
    const shuffledArray = array;
    for (let i = shuffledArray.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];

        if (i === 1) {
            callback(shuffledArray);
        }
    }
}
