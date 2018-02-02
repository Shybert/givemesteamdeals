const request = require("request");
const htmlparser = require("htmlparser2");
const mysql = require("mysql");
const EventEmitter = require("events");

function getPackages(callback) {
    // Setting up event emitter
    class GetPackagesEmitter extends EventEmitter {}
    const getPackagesEmitter = new GetPackagesEmitter();

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

    // Setting up variables
    let numberOfPages;
    let currentPage;
    // The initial steam link, used to find the number of pages to go through
    const initialSteamLink = "http://store.steampowered.com/search/results?sort_by=Released_DESC&category1=998&cc=en&v5=1&page=1";

    request(initialSteamLink, (err, res, body) => {
        if (err) {
            return console.log(`Error when requesting the initial Steam link: ${err}`);
        }
        console.log(`Requesting initial Steam link response code: ${res.statusCode}`);

        // Parse page to find total number of pages
        const parser = new htmlparser.Parser({
            ontext: (text) => {
                if (Number(text) > 750) {
                    numberOfPages = Number(text);
                    console.log(`The number of pages to go through is: ${numberOfPages}`);
                    currentPage = 1;
                    getPackagesEmitter.emit("nextSearchPageEvent");
                }
            },
        });
        parser.write(body);
        parser.end();
    });

    getPackagesEmitter.on("nextSearchPageEvent", () => {
        if (currentPage <= numberOfPages) {
            findSteamIds();
        } else {
            console.log("Finished going through Steam search pages");
            callback(null, "completed");
            connection.end();
        }
    });

    // Find relevant Steam Ids and pass them along
    function findSteamIds() {
        const steamLink = "http://store.steampowered.com/search/results?sort_by=Released_DESC&category1=998&cc=en&v5=1&page=" + currentPage.toString();

        // Request the appropriate page
        request(steamLink, (err, res, body) => {
            if (err) {
                return console.log(`Error while requesting steam page #${currentPage}: ${err}`);
            }
            console.log(`Steam page #${currentPage} response code: ${res.statusCode}`);

            const parser = new htmlparser.Parser({
                onopentag: (name, attribs) => {
                    if (name === "a" && attribs["data-ds-packageid"] !== undefined) {
                        if (attribs["data-ds-packageid"] !== undefined) {
                            const packageId = attribs["data-ds-packageid"];
                            const appIds = attribs["data-ds-appid"].split(",");
                            console.log(`Package ID: ${packageId}`);
                            console.log(`App Ids: ${appIds}`);
                            insertPackage(packageId, appIds);
                        }
                    }
                },
            });
            parser.write(body);
            parser.end();
            currentPage += 1;
            getPackagesEmitter.emit("nextSearchPageEvent");
        });
    }

    function insertPackage(packageId, appIds) {
        // Check if package has been inserted already
        console.log("Checking if package has been inserted already");
        connection.query(`SELECT steam_id FROM app WHERE steam_id = ${packageId}`, (selectErr, selectResults) => {
            if (selectErr) {
                return console.log(`Error while checking if package with ID(${packageId}) exists: ${selectErr}`);
            }
            if (selectResults.length === 0) {
                console.log(`Package with ID(${packageId}) doesn't exist, inserting`);
                connection.query(`INSERT INTO app(steam_id) values(${packageId})`, (insertErr, insertResults) => {
                    if (insertErr) {
                        return console.log(`Error while inserting packageId(${packageId}) into table app: ${insertErr}`);
                    }
                    if (insertResults) {
                        console.log(`Inserted packageId(${packageId}) to table app`);
                        createPackageMasterTable(packageId, appIds);
                    }
                });
            } else {
                return console.log(`Package with ID(${packageId}) already exists, not inserting`);
            }
        });
    }

    function createPackageMasterTable(packageId, appIds) {
        connection.query(`INSERT INTO package_master(app_steam_id) VALUES((SELECT steam_id FROM app WHERE steam_id = ${packageId}))`, (err, results) => {
            if (err) {
                return console.log(`Error while creating Package Master table with STEAM_ID(${packageId}): ${err}`);
            }
            if (results) {
                console.log(`Created package master table`);
                checkIfAppsExist(packageId, appIds);
            }
        });
    }

    function checkIfAppsExist(packageId, appIds) {
        appIds.forEach((id) => {
            connection.query(`SELECT steam_id FROM app WHERE steam_id = ${id}`, (err, results) => {
                if (err) {
                    return console.log(`Error while checking if app with STEAM_ID(${id}) exists: ${err}`);
                }
                if (results.length === 0) {
                    console.log(`App in PACKAGE(${packageId}) not inserted yet, inserting`);
                    connection.query(`INSERT INTO app(steam_id) VALUES (${id})`, (insertErr, insertResults) => {
                        if (insertErr) {
                            return console.log(`Error while inserting STEAM_ID(${id}) required for PACKAGE(${packageId}): ${insertErr}`);
                        }
                        if (insertResults) {
                            insertIntoAppPackageJoinTable(packageId, id);
                        }
                    });
                } else {
                    insertIntoAppPackageJoinTable(packageId, id);
                }
            });
        });
    }

    function insertIntoAppPackageJoinTable(packageId, id) {
        connection.query(`  INSERT INTO app_package(package_master_package_master_id, app_steam_id) VALUES(
                                        (SELECT package_master_id FROM package_master WHERE app_steam_id = ${packageId}),
                                        (SELECT steam_id FROM app WHERE steam_id = ${id}))`, (err, results) => {
            if (err) {
                return console.log(`Error while setting up app_package join table, with package_master_id(${packageId}) and steam_id(${id}): ${err}`);
            }
            if (results) {
                console.log("App_package join table created successfully");
            }
        });
    }
}

module.exports = getPackages;
