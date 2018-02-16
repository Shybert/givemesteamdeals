const express = require("express");
const path = require("path");
const hbs = require("hbs");

// Setting up basics
const app = express();
app.set("port", 3000);
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, "public")));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// App page requested
app.get("/id/:id", (req, res) => {
    const id = req.params.id;
    if (typeof id !== "number") {
        console.log(`Invalid NaN Steam ID requested`);
        return res.render("404");
    }
    console.log(`\nApp page with ID #${id} requested`);
    res.send("ye");
});

// Homepage requested
app.get("/", (req, res) => {
    console.log("\nMain page requested");
    res.render("index");
});

// No webpages found, 404 error
app.use((req, res) => {
    console.log("\n404 error encountered");
    res.status(404);
    res.render("404");
});

app.listen(app.get("port"), () => {
    console.log(`Started server, listening on port ${app.get("port")}`);
});

// Functions

