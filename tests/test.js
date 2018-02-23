const db = require("../modules/db2");
const misc = require("../modules/misc");

// db.getBasicData(10).then((data) => {
//     console.log(`Basic data: ${JSON.stringify(data)}`);
// });

// db.getDevOrPub(10, "developer").then((data) => {
//     console.log(`Dev/Pub data: ${JSON.stringify(data)}`);
// });

// db.getPriceAndSaleInfo(92100).then((data) => {
//     console.log(`Price and sale data: ${JSON.stringify(data)}`);
// });

// db.getGamesOnSale(16.1).then((data) => {
//     console.log(data.length);
// });

// const a = ["a", "b", "c"];
// misc.shuffleArray(a).then((data) => {
//     console.log(data);
// });

db.searchDB("dark souls").then((data) => {
    
});
