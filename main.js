const express = require("express");
const hbs = require("hbs");
const path = require("path");
const db = require("./modules/db");

// Interesting IDs: 10680

// Setting up basics
const app = express();
app.set("port", 3000);
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// App page requested
app.get("/id/:id", async (req, res) => {
    const id = req.params.id;
    console.log(`\nApp page requested, ID: ${id}`);

    let oGameData = (await db.getBasicData(id))[0];
    oGameData.developers = (await db.getDevOrPub(id, "developer"))[0];
    oGameData.publishers = (await db.getDevOrPub(id, "publisher"))[0];
    oGameData = await db.getPriceBoxInfo(id, oGameData);
    oGameData = await db.convertDataForAppPageDisplay(oGameData);

    console.log("All info found, rendering app page");
    res.render("appPage", oGameData);
});

// Search page requested
app.get("/search", async (req, res) => {
    const searchQuery = req.query.query;
    console.log(`Search page requested, query: ${searchQuery}`);

    const aSearchResults = await db.searchDB(searchQuery);
    console.log("Fetched searched for games, getting price box info");

    const aPriceBoxInfo = [];
    aSearchResults.forEach((element) => {
        aPriceBoxInfo.push(db.getPriceBoxInfo(element.steam_id, element));
    });

    // Putting the data into an object for Handlebars
    const obj = {};
    obj.data = await Promise.all(aPriceBoxInfo);

    console.log("All price box info found, rendering search page");
    res.render("index", obj);
});

app.get("/api/chart/:id", async (req, res) => {
    const id = req.params.id;

    console.log(`\nChart data requested for ID: ${id}`);
    const oChartData = await db.getChartData(id);

    console.log("Sending chart data");
    res.send(oChartData);
});

// Homepage requested
app.get("/", async (req, res) => {
    console.log("\nHomepage requested");
    const amount = 16;

    const aGamesOnSale = await db.getGamesOnSale(amount);
    console.log(`Fetched ${amount} games on sale`);

    console.log("Fetching price box info for the list");
    const aPriceBoxInfo = [];
    aGamesOnSale.forEach((element) => {
        aPriceBoxInfo.push(db.getPriceBoxInfo(element.steam_id, element));
    });

    // Putting the data into an object for Handlebars
    const obj = {};
    obj.data = await Promise.all(aPriceBoxInfo);

    console.log("All game sale info fetched, rendering homepage");
    res.render("index", obj);
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
