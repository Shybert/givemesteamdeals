const express = require("express");
const hbs = require("hbs");
const path = require("path");
const db = require("./modules/db");

// Interesting IDs: 10680

// Setting up basics
const app = express();
app.set("port", 3000);
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, "public")));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// Homepage requested
app.get("/", async (req, res) => {
    console.log("\nHomepage requested");
    const amount = 16;
    let aGamesOnSale;

    await db.getGamesOnSale(amount).then(async (data) => {
        aGamesOnSale = data;
        console.log(`Fetched list of ${amount} games on sale, fetching price/sale info now`);
    });

    for (let i = 0; i < aGamesOnSale.length; i += 1) {
        aGamesOnSale[i].price = db.getPriceAndSaleInfo(aGamesOnSale[i].steam_id);
        // console.log(aGamesOnSale);
        // await db.getPriceAndSaleInfo(aGamesOnSale[i].steam_id).then(async (data) => {
        //     array[i].priceHistory = data.priceHistory;
        //     array[i].saleHistory = data.saleHistory;
        // });
    }
    console.log(await aGamesOnSale[0]);

    // db.getGamesOnSale(amount).then(async (aGamesOnSale) => {
    //     const array = aGamesOnSale;
    //     console.log(`Fetched list of ${amount} games on sale, fetching price/sale info`);

    //     for (let i = 0; i < aGamesOnSale.length; i += 1) {
    //         db.getPriceAndSaleInfo(aGamesOnSale[i].steam_id).then(async (aPriceSaleInfo) => {
    //             array[i].priceHistory = aPriceSaleInfo.priceHistory;
    //             array[i].saleHistory = aPriceSaleInfo.saleHistory;
    //         });
    //     }
    //     console.log(await Promise.all(array));
    // });
    res.render("index");
});

// No webpages found, 404 error
app.use(async (req, res) => {
    console.log("\n404 error encountered");
    res.status(404);
    res.render("404");
});

app.listen(app.get("port"), async () => {
    console.log(`Started server, listening on port ${app.get("port")}`);
});
function newFunction(aGamesOnSale) {
    console.log(aGamesOnSale);
}

