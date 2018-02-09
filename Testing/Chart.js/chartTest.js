const express = require("express");
const mysql = require("mysql");

// Setting up express basics
const app = express();
app.set("view engine", "hbs");

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

    console.log("Connected to MySQL server");
});

app.get("/", (req, res) => {
    connection.query(`SELECT * FROM app WHERE steam_id = 10`, (err, results) => {
        if (err) {
            return console.log(`Error while querying data: ${err}`);
        }
        if (results) {
            console.log(results);
            const queryResults = {
                name: results[0].title,
                relDate: results[0].release_date,
                owners: results[0].owners,
                thumbnail: results[0].thumbnail,
            };
            connection.query(`SELECT * FROM price_history WHERE app_steam_id = 92100`, (priceErr, priceResults) => {
                console.log("Querying price info");
                if (err) {
                    return console.log(`Error while querying price data: ${err}`);
                }
                console.log(priceResults);
                res.render("chartTest", queryResults);
            });
        }
    });
});

// Starting server fully
app.listen(3000);
console.log("Listening at port 3000");
