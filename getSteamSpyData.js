const request = require("request");
const mysql = require("mysql");
const EventEmitter = require("events");

function getSteamSpyData(callback) {
    // Setting up event emitters
    class SteamSpyEmitter extends EventEmitter {}
    const steamSpyEmitter = new SteamSpyEmitter();

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
    console.log("Requesting SteamSpy JSON file");
    request({url: "https://steamspy.com/api.php?request=all", json: true}, (err, res, body) => {
        if (err) {
            return console.log(`Error while requesting JSON file form SteamSpy: ${err}`);
        }
        console.log(`Response code when requesting JSON file from SteamSpy: ${res.statusCode}`);

        appArray = Object.entries(body);
        amountOfEntries = appArray.length;
        steamSpyEmitter.emit("nextInsert");
    });

    steamSpyEmitter.on("nextInsert", () => {
        if (currentEntry < amountOfEntries) {
            insertIntoMySql();
        } else {
            console.log("Finished collecting Steam IDs");
            callback(null, "completed");
            connection.end();
        }
    });

    function insertIntoMySql() {
        const gameInfoObj = appArray[currentEntry][1];
        console.log(`\n--- GAME ID: ${appArray[currentEntry][0]} ---`);
        // Inserting the basic information to MySQL
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
                            ${gameInfoObj.median_2weeks})
                            ON DUPLICATE KEY UPDATE
                            steam_rating_positive = ${gameInfoObj.positive},
                            steam_rating_negative = ${gameInfoObj.negative},
                            owners = ${gameInfoObj.owners},
                            players_forever = ${gameInfoObj.players_forever},
                            players_2weeks = ${gameInfoObj.players_2weeks},
                            average_forever = ${gameInfoObj.average_forever},
                            average_2weeks = ${gameInfoObj.average_2weeks},
                            median_forever = ${gameInfoObj.median_forever},
                            median_2weeks = ${gameInfoObj.median_2weeks}`, (err, results) => {
            if (err) {
                return console.log(`Error while inserting basic data into MySQL: ${err}`);
            }
            // Upon results callback, insert developer
            if (results) {
                console.log("Basic data inserted successfully");
                insertCompany(connection.escape(gameInfoObj.developer), "developer");
            }
        });
    }

    function insertCompany(companyName, devOrPub) {
        let companyNameVar = companyName;
        if (companyNameVar === "NULL") {
            companyNameVar = "''";
        }
        // Check if the company has been inserted already
        connection.query(`SELECT name FROM company WHERE name = ${companyNameVar}`, (err, results) => {
            if (err) {
                return console.log(`Error while checking if company with NAME(${companyNameVar}) has been inserted already: ${err}`);
            }
            if (results.length === 0) {
                // Company has not yet been inserted
                connection.query(`INSERT INTO company(name) VALUES(${companyNameVar})`, (insertCompanyErr, insertCompanyResults) => {
                    if (insertCompanyErr) {
                        return console.log(`Error while inserting company with NAME(${companyNameVar}): ${err}`);
                    }
                    if (insertCompanyResults) {
                        console.log(`Inserting ${devOrPub}`);
                        createCompanyJoinTable(companyNameVar, devOrPub);
                    }
                });
            } else {
                // Company has already been inserted, do not insert
                console.log(`${devOrPub} already inserted`);
                createCompanyJoinTable(companyNameVar, devOrPub);
            }
        });
    }

    function createCompanyJoinTable(companyName, devOrPub) {
        // Queries information from table App and Company, then sets up the join table
        connection.query(`  INSERT INTO ${devOrPub}(company_company_id, app_steam_id) VALUES(
                            (SELECT company_id FROM company WHERE name = ${companyName}),
                            (SELECT steam_id FROM app WHERE steam_id = ${appArray[currentEntry][0]}))
                            ON DUPLICATE KEY UPDATE app_steam_id = (SELECT steam_id FROM app WHERE steam_id = ${appArray[currentEntry][0]})`, (err, results) => {
            if (err) {
                return console.log(`Error while creating join table with COMPANY(${companyName}) and STEAMID(${appArray[currentEntry][0]}): ${err}`);
            }
            if (results) {
                console.log(`${devOrPub} join table created succesfully`);
                if (devOrPub === "developer") {
                    insertCompany(connection.escape(appArray[currentEntry][1].publisher), "publisher");
                } else if (devOrPub === "publisher") {
                    console.log(`Current entry: ${currentEntry}`);
                    currentEntry += 1;
                    steamSpyEmitter.emit("nextInsert");
                } else {
                    return console.log("In the function createCompanyJoinTable(), devOrPub was not 'developer' or 'publisher', which should be impossible.");
                }
            }
        });
    }
}

module.exports = getSteamSpyData;
