const db = require("../modules/db.js");

db.getBasicData(10, (err, data) => {
    if (err) {
        return console.error(`Getting basic data: ${err}`);
    }
    console.log(data);
});

db.getDevOrPub(10, "publish", (err, data) => {
    if (err) {
        return console.error(err);
    }
    console.log(data);
});
