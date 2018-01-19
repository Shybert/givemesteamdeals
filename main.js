const htmlparser = require("htmlparser2");
const request = require("request");
const EventEmitter = require("events");

// Setting up event emitters
class GetSteamIdsEmitter extends EventEmitter {}
const getSteamIdsEmitter = new GetSteamIdsEmitter();

// The initial steam link, used to find the number of pages to go through
const initialSteamLink = "http://store.steampowered.com/search/results?sort_by=Released_DESC&category1=998&cc=en&v5=1&page=1";
let numberOfPages;

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
                getSteamIdsEmitter.emit("pagenum");
            }
        },
    });
    parser.write(body);
    parser.end();
});

getSteamIdsEmitter.on("pagenum", () => {
    console.log(`The number of pages to go through is: ${numberOfPages}`);

    
});
