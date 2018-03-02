const misc = require("./misc");
const rp = require("request-promise");
const cheerio = require("cheerio");
const knex = require("knex")({
    client: "mysql",
    connection: {
        user: "root",
        password: "nSPemHJ5Hc",
        database: "gamesdb",
    },
    useNullAsDefault: true,
    acquireConnectionTimeout: 60000000,
});

module.exports.fetchSteamSpy = async () => {
    try {
        console.log("Fetching Steam Spy information started");

        console.log("Setting up Steam Spy options");
        const oSteamSpyOptions = {
            uri: "https://steamspy.com/api.php?request=all",
            headers: {
                "User-Agent": "Request-Promise",
            },
            json: true,
        };

        console.log("Requesting data from SteamSpy");
        const oSteamSpyData = await rp(oSteamSpyOptions);

        console.log("Inserting Steam Spy data into database");
        await Object.entries(oSteamSpyData).forEach(async ([key, value]) => {
            misc.log(key, "Inserting data");

            misc.log(key, "Checking if key exists");
            const aSelectResults = await knex.select("steam_id").from("app").where("steam_id", key);
            if (aSelectResults.length === 0) {
                misc.log(key, "Key doesn't yet exist");
                await knex("app").insert({
                    steam_id: key,
                });
            } else {
                misc.log(key, "Key exists");
            }

            misc.log(key, "Updating SteamSpy data");
            await knex("app").update({
                steam_rating_positive: value.positive,
                steam_rating_negative: value.negative,
                owners: value.owners,
                players_forever: value.players_forever,
                players_2weeks: value.players_2weeks,
                average_forever: value.average_forever,
                average_2weeks: value.average_2weeks,
                median_forever: value.median_forever,
                median_2weeks: value.median_2weeks,
            });

            misc.log(key, "Insertion completed");
        });

        console.log("Finished SteamSpy database insertions");
    } catch (err) {
        console.error(`Error while fetching Steam Spy information: ${err}`);
    }
};

module.exports.fetchPackages = async () => {
    try {
        console.log("Fetching packages started");
        const oSteamLink = {
            uri: "http://store.steampowered.com/search/results?sort_by=Released_DESC&category1=998&cc=en&v5=1&page=1",
            transform: body => cheerio.load(body),
        };

        console.log("Finding the initial number of pages to go through");
        rp(oSteamLink)
            .then(($) => {
                console.log($('div').text());
            });

    } catch (err) {
        console.error(`Error while fetching packages: ${err}`);
    }
};
