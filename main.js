const htmlparser = require("htmlparser2");
const request = require("request");
const EventEmitter = require("events");
const mysql = require("mysql");

// Setting up event emitters
class GetSteamIdsEmitter extends EventEmitter {}
const getSteamIdsEmitter = new GetSteamIdsEmitter();

// Setting up MySQL
const connection = mysql.createConnection({
    user: "root",
    password: "3oFkAlziyG",
    database: "games_list_test",
});
connection.connect((err) => {
    if (err) {
        return console.log(`Error while connecting to MySQL: ${err}`);
    }
    console.log("Connected to the MySQL server.");
});

// The initial steam link, used to find the number of pages to go through
const initialSteamLink = "http://store.steampowered.com/search/results?sort_by=Released_DESC&category1=998&cc=en&v5=1&page=1";

let numberOfPages;
let currentPage;

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
                getSteamIdsEmitter.emit("pageNumEvent");
            }
        },
    });
    parser.write(body);
    parser.end();
});

getSteamIdsEmitter.on("pageNumEvent", () => {
    console.log(`The number of pages to go through is: ${numberOfPages}`);

    // Sets up the page to start going through
    currentPage = 1;
    findSteamIds();
});

getSteamIdsEmitter.on("nextSearchPageEvent", () => {
    if (currentPage <= numberOfPages) {
        findSteamIds();
    } else {
        console.log("Finished going through Steam search pages");
    }
});

// The function, called multiple times, to find Steam IDs
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
                if (name === "a" && attribs.class === "search_result_row ds_collapse_flag") {
                    if (attribs["data-ds-packageid"] !== undefined) {
                        connection.query(`INSERT INTO games(steam_id) VALUES(${attribs["data-ds-packageid"]})`, (err) => {
                        });
                        console.log(`Package ID: ${attribs["data-ds-packageid"]}`);
                    } else {
                        connection.query(`INSERT INTO games(steam_id) VALUES(${attribs["data-ds-appid"]})`, (err) => {
                        });
                        console.log(`App ID: ${attribs["data-ds-appid"]}`);
                    }
                }
            },
        });
        parser.write(body);
        parser.end();
        currentPage += 1;
        getSteamIdsEmitter.emit("nextSearchPageEvent");
    });
}
