const misc = require("../modules/misc");
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

// Specifications:
// 'a' before name = Array
// 'o' before name = Object

module.exports.getBasicData = async (id) => {
    try {
        misc.log(id, "Fetching basic data");
        const data = await knex.select().from("app").where("steam_id", id);
        misc.log(id, "Fetched basic data");

        return data;
    } catch (err) {
        console.error(`ID#${id}: Error while fetching basic data: ${err}`);
    }
};

module.exports.getDevOrPub = async (id, devOrPub) => {
    // Check if 'devOrPub' is valid
    if (devOrPub !== "developer" && devOrPub !== "publisher") {
        throw console.error(new Error("devOrPub must be either 'developer' or 'publisher'"));
    }

    try {
        misc.log(id, `Fetching ${devOrPub} IDs`);
        const companyIdArray = await knex.select().from(devOrPub).where("app_steam_id", id);
        misc.log(id, `Fetched ${devOrPub} IDs`);

        misc.log(id, `Fetching ${devOrPub} names`);
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

module.exports.getPriceBoxInfo = async (id, obj) => {
    try {
        misc.log(id, "Fetching price box info");
        const oPriceBox = Object.assign(obj, (await getCurrentPriceAndSaleInfo(id, obj)));
        misc.log(id, "Fetched price box info");

        misc.log(id, "Checking sale status");
        if (oPriceBox.saleHistory !== undefined) {
            misc.log(id, "Game is on sale, getting discount percent");
            const price = oPriceBox.priceHistory.price;
            const salePrice = oPriceBox.saleHistory.price;
            oPriceBox.discount_percent = Math.round(((price - salePrice) / price) * 100);
            misc.log(id, "Discount percent gotten");
        } else {
            misc.log(id, "Game is not on sale, making 'on_sale' undefined");
            oPriceBox.on_sale = undefined;
        }
        misc.log(id, "Sale status checked and fixed");

        return oPriceBox;
    } catch (err) {
        console.error(`Error while fetching price box info: ${err}`);
    }
};

module.exports.getGamesOnSale = async (limit) => {
    try {
        // Check if 'limit' is an integer
        if (Number.isInteger(limit) !== true) {
            throw new TypeError("'Limit' must be an integer");
        }

        console.log("Fetching list of games on sale");
        const aGamesOnSale = await knex.select().from("app").where("on_sale", 1);
        console.log("Fetched list of games on sale, shuffling list");
        const aShuffled = await misc.shuffleArray(aGamesOnSale);
        console.log("List of games on sale shuffled, limiting list");

        // Limiting the shuffled array to 'limit', if it is longer
        if (aShuffled.length > limit) {
            aShuffled.length = limit;
        }
        console.log("Limited shuffled list of games on sale");

        return aShuffled;
    } catch (err) {
        console.error(`Error while fetching games currently on sale: ${err}`);
    }
};

module.exports.getChartData = async (id) => {
    try {
        misc.log(id, "Fetching chart data");

        misc.log(id, "Fetching steam rating chart data");
        let oChartData = (await knex.select("steam_rating_percent", "steam_rating_positive", "steam_rating_negative").from("app").where("steam_id", id))[0];
        misc.log(id, "Fetched steam rating chart data");

        misc.log(id, "Fetching price history chart data");
        oChartData = await getAllTimePriceAndSaleInfo(id, oChartData);
        misc.log(id, "Finished fetching price history chart data");

        misc.log(id, "Finished fetching chart data");
        return oChartData;
    } catch (err) {
        console.error(`Error while fetching chart data: ${err}`);
    }
};

module.exports.convertDataForAppPageDisplay = async (obj) => {
    try {
        const oConverted = obj;
        console.log("Converting data for app page display");

        console.log("Appending metacritic link base");
        if (typeof oConverted.metacritic_link === "string") {
            oConverted.metacritic_link = `http://www.metacritic.com${oConverted.metacritic_link}`;
            console.log("Appended metacritic link base");
        } else {
            console.log("This app doesn't have a metacritic link, skipping");
        }

        console.log("Converting release date");
        if (oConverted.release_date === "0") {
            oConverted.release_date = undefined;
            console.log("No release date, release date now set to undefined");
        } else {
            // Multiply by 1000 to get unix time / for JavaScript
            console.log("Multiplying time by 1000, and setting it to a date");
            oConverted.release_date = new Date(oConverted.release_date * 1000);

            console.log("Converting date to ISO string, and limiting it to just the date");
            oConverted.release_date = oConverted.release_date.toISOString().substr(0, 10);
        }

        console.log("Finished converting data for app page display");
        return oConverted;
    } catch (err) {
        console.error(`Error while converting data for app page display: ${err}`);
    }
};

module.exports.searchDB = async (searchTerm) => {
    try {
        console.log(`Searching database with the search term: ${searchTerm}`);
        const aSearchResults = await knex.select().from("app").where("title", "REGEXP", searchTerm);
        console.log("Database search finished");

        console.log("Limiting db search results to 50");
        // Limit results to 50, for now...
        if (aSearchResults.length > 50) {
            aSearchResults.length = 50;
        }

        return aSearchResults;
    } catch (err) {
        console.error(`Error while searching db: ${err}`);
    }
};

// Internal functions go here
async function getCurrentPriceAndSaleInfo(id, obj) {
    try {
        misc.log(id, "Getting all time price and sale info");
        const oWithPriceSale = obj;

        misc.log(id, "Fetching price history");
        oWithPriceSale.priceHistory = (await knex.select().from("price_history").where("app_steam_id", id).andWhere("end_date", null))[0];
        misc.log(id, "Price history fetched");

        misc.log(id, "Fetching sale history");
        oWithPriceSale.saleHistory = (await knex.select().from("sale_history").where("app_steam_id", id).andWhere("end_date", null))[0];
        misc.log(id, "Sale history fetched");

        misc.log(id, "Fetched price and sale info");
        return oWithPriceSale;
    } catch (err) {
        console.error(`Error while getting current price and sale info: ${err}`);
    }
}

async function getAllTimePriceAndSaleInfo(id, obj) {
    try {
        misc.log(id, "Getting all time price and sale info");
        const oWithPriceSale = obj;

        misc.log(id, "Fetching price history");
        oWithPriceSale.priceHistory = (await knex.select().from("price_history").where("app_steam_id", id));
        misc.log(id, "Price history fetched");

        misc.log(id, "Fetching sale history");
        oWithPriceSale.saleHistory = (await knex.select().from("sale_history").where("app_steam_id", id));
        misc.log(id, "Sale history fetched");

        misc.log(id, "Fetched price and sale info");
        return oWithPriceSale;
    } catch (err) {
        console.error(`Error while getting all time price and sale info: ${err}`);
    }
}
