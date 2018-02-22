const mysql = require("mysql");
const async = require("async");

// MySQL connection, usable throughout the app
const connection = mysql.createConnection({
    user: "root",
    password: "3oFkAlziyG",
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
    if (devOrPub !== "developer" && devOrPub !== "publisher") {
        return callback(new Error("devOrPub must be either 'developer' or 'publisher'"));
    }

    console.log(`ID#${id}: Getting ${devOrPub}`);

    connection.query(`SELECT * FROM ${devOrPub} WHERE app_steam_id = ${id}`, (err, results) => {
        if (err) {
            return callback(err);
        }
        console.log(`ID#${id}: Fetched ${devOrPub} IDs, finding names`);

        async.concat(results, (item, concatCallback) => {
            connection.query(`SELECT name FROM company WHERE company_id = ${item.company_company_id}`, (queryErr, queryResults) => {
                if (queryErr) {
                    return concatCallback(queryErr);
                }
                // Found values successfully, return
                concatCallback(null, queryResults);
            });
        }, (concatErr, concatResults) => {
            if (concatErr) {
                return callback(err);
            }
            console.log(`Found developer names: ${JSON.stringify(concatResults)}`);
            callback(null, concatResults);
        });
    });
};

module.exports.getPriceAndSaleInfo = (id, callback) => {
    console.log(`ID#${id}: Getting price and sale information`);
    // Returns an object with the relevant info
    const priceAndSaleInfoObj = {};

    async.parallel({
        priceHistory: appSteamIdQuery(id, "price_history"),
    }, (err, data) => {
        console.log(data);
    });

    // connection.query(`SELECT * FROM price_history WHERE app_steam_id = ${id}`, (priceErr, priceResults) => {
    //     if (priceErr) {
    //         return callback(priceErr);
    //     }
    //     priceAndSaleInfoObj.priceHistory = priceResults;
    //     console.log(`ID#${id}: Queried for price information, now querying for sale information`);

    //     connection.query(`SELECT * FROM sale_history WHERE app_steam_id = ${id}`, (saleErr, saleResults) => {
    //         if (saleErr) {
    //             return callback(saleErr);
    //         }
    //         priceAndSaleInfoObj.saleHistory = saleResults;
    //         console.log(`Queried for sale information`);

    //         callback(null, priceAndSaleInfoObj);
    //     });
    // });
};

// Functions
// Generic function for querying information from tables where you use 'app_steam_id'
function appSteamIdQuery(id, table, callback) {
    connection.query(`SELECT * FROM ${table} WHERE app_steam_id = ${id}`, (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
}
