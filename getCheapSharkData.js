const mysql = require("mysql");
const request = require("request");
const EventEmitter = require("events");
getCheapSharkData();
function getCheapSharkData(callback {
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

    // Global variable
    let currentSet;
    let isFinished = false;
    let IDsArray;

    // Getting all saved Steam IDs
    connection.query("SELECT steam_id FROM app", (err, results) => {
        if (err) {
            return console.log(`Error while querying for Steam IDs: ${err}`);
        }
        if (results) {
            console.log(`Amount of Steam IDs: ${results.length}`);
            currentSet = 287;
            IDsArray = results;
            setUpLinks();
        }
    });


    // Set up the correct CheapShark links
    function setUpLinks() {
        const IDs = IDsArray;
        const currentRange = 60 * currentSet;
        let link = "http://www.cheapshark.com/api/1.0/deals?storeID=1&steamAppID=";

        if (currentRange + 60 > IDs.length) {
            for (let i = 0 + currentRange; i < IDs.length; i += 1) {
                console.log(IDs[i].steam_id);
                if (i === IDs.length - 1) {
                    console.log("This is the last set");
                    isFinished = true;
                    link += IDs[i].steam_id;
                    console.log(`Finished link: ${link}`);
                    // Now that the link is completed, request the JSON file
                    requestJSON(link);
                } else {
                    link += `${IDs[i].steam_id},`;
                }
            }
        } else {
            // Loop through the next 60 IDs
            for (let i = 0 + currentRange; i < 60 + currentRange; i += 1) {
                console.log(IDs[i].steam_id);
                if (i === 59 + currentRange) {
                    link += IDs[i].steam_id;
                    console.log(`Finished link: ${link}`);
                    // Now that the link is completed, request the JSON file
                    requestJSON(link);
                } else {
                    link += `${IDs[i].steam_id},`;
                }
            }
        }
    }

    // Global variables needed to access the correct data
    let appArray;
    let currentEntry;
    let amountOfEntries;

    function requestJSON(link) {
        console.log("Requesting JSON file");

        // Request the JSON file
        request({url: link, json: true}, (err, res, body) => {
            if (err) {
                return console.log(`Error while requesting JSON file: ${err}`);
            }
            if (res) {
                console.log(`Response code from CheapShark: ${res.statusCode}`);

                appArray = Object.entries(body);
                currentEntry = 0;
                amountOfEntries = appArray.length;
                cheapSharkEmitter.emit("nextEntry");
            }
        });
    }

    cheapSharkEmitter.on("nextEntry", () => {
        if (currentEntry === amountOfEntries) {
            // When finished runnning through current entries, move to the next set
            console.log(`\nFinished inserting data in range #${currentSet}`);
            currentSet += 1;
            if (isFinished === true) {
                console.log("Finished collecting SteamShark data");
                callback(null, "completed");
                connection.end();
            } else {
                setTimeout(setUpLinks, 10000);
            }
        } else {
            insertBasicData();
        }
    });

    function insertBasicData() {
        const currentGame = appArray[currentEntry][1];
        console.log(`\n--- GAME ID: ${currentGame.steamAppID} ---`);
        // Updating table to add new data from CheapShark
        connection.query(`  UPDATE app SET
                            internal_name = ${connection.escape(currentGame.internalName)},
                            title = ${connection.escape(currentGame.title)},
                            steam_rating_text = ${connection.escape(currentGame.steamRatingText)},
                            steam_rating_percent = ${connection.escape(currentGame.steamRatingPercent)},
                            release_date = ${connection.escape(currentGame.releaseDate)},
                            last_change = ${connection.escape(currentGame.lastChange)},
                            metacritic_link = ${connection.escape(currentGame.metacriticLink)},
                            thumbnail = ${connection.escape(currentGame.thumb)}
                            WHERE steam_id = ${connection.escape(currentGame.steamAppID)}`, (err, results) => {
            if (err) {
                return console.log(`Error while inserting basic data: ${err}`);
            }
            if (results) {
                console.log(`Inserted basic data successfully`);
                checkPriceHistoryData();
            }
        });
    }

    function checkPriceHistoryData() {
        const currentGame = appArray[currentEntry][1];
        const id = currentGame.steamAppID;
        // Query for potential previous data, to see if the price has changed
        connection.query(`SELECT price FROM price_history WHERE app_steam_id = ${connection.escape(id)} AND end_date IS NULL`, (err, results) => {
            if (err) {
                return console.log(`Error while querying for price_history data: ${err}`);
            }
            if (results.length === 0) {
                console.log(`No price data inserted yet`);
                // Insert data without setting a previous end_date to a value
                insertPriceHistoryData();
            } else if (results[0].price === currentGame.normalPrice) {
                console.log(`Price unchanged`);
                // Insert sale history
                cheapSharkEmitter.emit("sale");
                // currentEntry += 1;
                // cheapSharkEmitter.emit("nextEntry");
            } else {
                console.log(`Price has changed`);
                // Change the end_date of the currently inserted price
                connection.query(`  UPDATE price_history SET
                                    end_date = (SELECT NOW())
                                    WHERE app_steam_id = ${id} AND end_date IS NULL`, (endErr, endResults) => {
                    if (endErr) {
                        return console.log(`Error while changing price end_date: ${endErr}`);
                    }
                    if (endResults) {
                        console.log(`Changed price end_date successfully`);
                        insertPriceHistoryData();
                    }
                });
            }
        });
    }

    function insertPriceHistoryData() {
        const currentGame = appArray[currentEntry][1];
        const id = currentGame.steamAppID;
        connection.query(`  INSERT INTO price_history(app_steam_id, price, start_date) VALUES(
                            (SELECT steam_id FROM app WHERE steam_id = ${id}),
                            ${currentGame.normalPrice},
                            (SELECT NOW()))`, (err, results) => {
            if (err) {
                return console.log(`Error while inserting price information: ${err}`);
            }
            if (results) {
                console.log(`Inserted price information`);
                // Insert sale history
                cheapSharkEmitter.emit("sale");
                // currentEntry += 1;
                // cheapSharkEmitter.emit("nextEntry");
            }
        });
    }

    cheapSharkEmitter.on("sale", () => {
        const currentGame = appArray[currentEntry][1];
        const id = currentGame.steamAppID;
        // Check if on_sale matches between CheapShark and gamesdb
        connection.query(`SELECT on_sale FROM app WHERE steam_id = ${id}`, (err, results) => {
            if (err) {
                return console.log(`Error while querying for on_sale`);
            }
            if (results) {
                const onSaleDB = Number(results[0].on_sale);
                const onSaleCheapShark = Number(currentGame.isOnSale);

                if (onSaleDB === onSaleCheapShark) {
                    console.log(`Sale status unchanged`);
                    currentEntry += 1;
                    cheapSharkEmitter.emit("nextEntry");
                } else if (onSaleDB === 1 && onSaleCheapShark === 0) {
                    // Game is no longer on sale
                    changeOnSale(0);
                } else if (onSaleDB === 0 && onSaleCheapShark === 1) {
                    // Game is now on sale
                    changeOnSale(1);
                }
            }
        });
    });

    function changeOnSale(newValue) {
        const currentGame = appArray[currentEntry][1];
        const id = currentGame.steamAppID;
        // Give on_sale a new value
        connection.query(`UPDATE app SET on_sale = ${newValue} WHERE steam_id = ${id}`, (err, results) => {
            if (err) {
                return console.log(`Error while changing on_sale: ${err}`);
            }
            if (results) {
                console.log(`on_sale changed successfully`);

                if (newValue === 0) {
                    // Sale has ended, set end_date value
                    connection.query(`UPDATE sale_history SET end_date = (SELECT NOW()) WHERE app_steam_id = ${id} AND end_date IS NULL`, (updateErr, updateResults) => {
                        if (updateErr) {
                            return console.log(`Error while setting sale end_date: ${updateErr}`);
                        }
                        if (updateResults) {
                            console.log(`Updated sale end_date`);
                            currentEntry += 1;
                            cheapSharkEmitter.emit("nextEntry");
                        }
                    });
                } else if (newValue === 1) {
                    // Sale has started, new information to input
                    insertSaleHistoryData();
                }
            }
        });
    }

    function insertSaleHistoryData() {
        const currentGame = appArray[currentEntry][1];
        const id = currentGame.steamAppID;
        connection.query(`  INSERT INTO sale_history(app_steam_id, price, start_date) VALUES(
                            (SELECT steam_id FROM app WHERE steam_id = ${id}),
                            ${currentGame.salePrice},
                            (SELECT NOW()))`, (err, results) => {
            if (err) {
                return console.log(`Error while inserting sale history data: ${err}`);
            }
            if (results) {
                console.log(`Sale history data inserted successfully`);
                currentEntry += 1;
                cheapSharkEmitter.emit("nextEntry");
            }
        });
    }
}

module.exports = getCheapSharkData;
