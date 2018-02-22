const db = require("../modules/db.js");

// db.getBasicData(10, (err, data) => {
//     if (err) {
//         return console.error(`Getting basic data: ${err}`);
//     }
//     console.log(data);
// });

// db.getDevOrPub(10, "publisher", (err, data) => {
//     if (err) {
//         return console.error(`An error: ${err}`);
//     }
//     console.log(`Data from fetching devs: ${JSON.stringify(data)}`);
// });

db.getPriceAndSaleInfo(10680, (err, data) => {
    if (err) {
        return console.error(err);
    }
    console.log(data);
});
