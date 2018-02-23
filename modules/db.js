const misc = require("../modules/misc");
const knex = require("knex")({
    client: "mysql",
    connection: {
        user: "root",
        password: "3oFkAlziyG",
        database: "gamesdb",
    },
});

// Specifications:
// 'a' before name = Array
// 'o' before name = Object

module.exports.getBasicData = async (id) => {
    try {
        console.log(`ID#${id}: Fetching basic data`);
        const data = await knex.select().from("app").where("steam_id", id);
        return data;
    } catch (err) {
        console.error(`ID#${id}: Error while fetching basic data: ${err}`);
    }
};

module.exports.getDevOrPub = async (id, devOrPub) => {
    // Check if 'devOrPub' is valid
    if (devOrPub !== "developer" && devOrPub !== "publisher") {
        return console.error(new Error("devOrPub must be either 'developer' or 'publisher'"));
    }

    try {
        console.log(`ID#${id}: Fetching ${devOrPub}`);
        const companyIdArray = await knex.select().from(devOrPub).where("app_steam_id", id);

        const data = [];
        for (let i = 0; i < companyIdArray.length; i += 1) {
            data.push((knex.select("name").from("company")
                .where("company_id", companyIdArray[i].company_company_id)));
        }

        return (await Promise.all(data));
    } catch (err) {
        console.error(`ID#${id}: Error while fetching dev/pub: ${err}`);
    }
};

module.exports.getPriceAndSaleInfo = async (id) => {
    try {
        console.log(`ID#${id}: Fetching price and sale info`);
        const priceArray = await knex.select().from("price_history").where("app_steam_id", id);
        const saleArray = await knex.select().from("sale_history").where("app_steam_id", id);

        const priceAndSaleObj = {};
        priceAndSaleObj.priceHistory = priceArray;
        priceAndSaleObj.saleHistory = saleArray;

        return priceAndSaleObj;
    } catch (err) {
        console.error(`ID#${id}: Error while fetching price and sale information: ${err}`);
    }
};

module.exports.getGamesOnSale = async (limit) => {
    try {
        // Check if 'limit' is an integer
        if (Number.isInteger(limit) !== true) {
            throw new TypeError("'Limit' must be an integer");
        }

        console.log("Getting list of games on sale");
        const aGamesOnSale = await knex.select().from("app").where("on_sale", 1);
        const aShuffled = await misc.shuffleArray(aGamesOnSale);

        // Limiting the shuffled array to 'limit', if it is longer
        if (aShuffled.length > limit) {
            aShuffled.length = limit;
        }

        return aShuffled;
    } catch (err) {
        console.error(`Error while fetching games currently on sale: ${err}`);
    }
};

module.exports.searchDB = async (searchTerm) => {
    try {
        console.log(`Searching database with the search term: ${searchTerm}`);

        const aSearchResults = await knex.select().from("app").where("title", "REGEXP", searchTerm);
        return aSearchResults;
    } catch (err) {
        console.error(`Error while searching db: ${err}`);
    }
};
