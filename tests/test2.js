const db = require("../modules/db2");

db.getBasicData(10).then((data) => {
    console.log(`Basic data: ${JSON.stringify(data)}`);
});

db.getDevOrPub(10, "publisher").then((data) => {
    console.log(`Dev/Pub data: ${JSON.stringify(data)}`);
});
