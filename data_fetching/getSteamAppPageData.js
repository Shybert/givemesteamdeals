const cheerio = require("cheerio");
const rp = require("request-promise");

const options = {
    uri: "http://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/",
    transform: (body) => {
        return cheerio.load(body);
    },
};

