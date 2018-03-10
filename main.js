const express = require("express");
const hbs = require("hbs");
const path = require("path");

const misc = require("./modules/misc");
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

    misc.log(id, "Checking Steam rating");
    oGameData.ratingStatus = "ratingMixed";
    if (oGameData.steam_rating_percent >= 70) {
        oGameData.ratingStatus = "ratingPositive";
    } else if (oGameData.steam_rating_percent <= 39) {
        oGameData.ratingStatus = "ratingNegative";
    }

    console.log("All info found, rendering app page");
    res.render("appPage", oGameData);
});

// Search page requested
app.get("/search", async (req, res) => {
    const searchQuery = req.query.query;
    console.log(`\nSearch page requested, query: ${searchQuery}`);

    const aSearchResults = await db.searchDB(searchQuery);
    console.log("Fetched searched for games, getting price box info");

    const aPriceBoxInfo = [];
    aSearchResults.forEach((element) => {
        aPriceBoxInfo.push(db.getPriceBoxInfo(element.steam_id, element));
    });

    // Putting the data into an object for Handlebars
    const obj = {};
    obj.data = await Promise.all(aPriceBoxInfo);
    obj.searchQuery = searchQuery;

    console.log("All price box info found, rendering search page");
    res.render("search", obj);
});

app.get("/company/:id", async (req, res) => {
    const id = req.params.id;
    console.log(`\nCompany page requested, ID: ${id}`);

    const oCompanyData = await db.getCompanyData(id);

    console.log("Company data fetched, rendering company page");
    res.render("company", oCompanyData);
});

app.get("/api/chart/:id", async (req, res) => {
    const id = req.params.id;
    console.log(`\nChart data requested for ID: ${id}`);

    const oChartData = await db.getChartData(id);

    console.log("Sending chart data");
    console.log(oChartData);
    res.send(oChartData);
});

// Price track requested
app.get("/track/:id", async (req, res) => {
    const id = req.params.id;
    console.log(`\nTrack price request for ID: ${id}`);
    const oTrackData = {
        price: req.query.price,
        email: req.query.email,
        name: req.query.name,
    };

    // Verify data
    // Insert has been sent func

    await db.insertTrackData(id, oTrackData);
});

// Company edit requested
app.get("/companyedit/:id", async (req, res) => {
    const id = req.params.id;
    console.log(`\nCompany data edit request for ID: ${id}`);

    console.log("Putting query parameters into an object");
    console.log(`Query params: ${JSON.stringify(req.query)}`);
    const oEditData = {};
    oEditData.text = req.query.text;

    if (req.query.foundingYear.length === 0) {
        oEditData.foundingYear = null;
    } else {
        oEditData.foundingYear = req.query.foundingYear;
    }
    if (req.query.logo.length === 0) {
        oEditData.logo = null;
    } else {
        oEditData.logo = req.query.logo;
    }

    await db.insertCompanyData(id, oEditData);

    console.log("Redirecting to company");
    res.redirect(`/company/${id}`);
});

// About page requested
app.get("/about", async (req, res) => {
    console.log("About page requested");
    console.log("Rendering about page");
    res.render("about");
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
