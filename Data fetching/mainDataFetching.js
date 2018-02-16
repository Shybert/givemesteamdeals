const getSteamSpyData = require("./getSteamSpyData");
const getPackages = require("./getPackages");
const getCheapSharkData = require("./getCheapSharkData");
const schedule = require("node-schedule");

// Scheduled
console.log("Schedule started, running at 00:00 every day");
const i = schedule.scheduleJob("0 0 * * *", () => {
    console.log("Scheduling job");
    getSteamSpyData((err, results) => {
        if (results === "completed") {
            console.log("\nFunction getSteamSpyData has completed");
            console.log("Executing function getPackages()");
            getPackages((pacakgeErr, packageResults) => {
                if (packageResults === "completed") {
                    console.log("\nFunction getPackages has completed");
                    console.log("Executing function getCheapSharkData()");
                    getCheapSharkData((cheapSharkErr, cheapSharkResults) => {
                        if (cheapSharkResults === "completed") {
                            console.log("\nFunction getCheapSharkData() has completed");
                        }
                    });
                }
            });
        }
    });
});

// // No schedule
// getSteamSpyData((err, results) => {
//     if (results === "completed") {
//         console.log("\nFunction getSteamSpyData has completed");
//         console.log("Executing function getPackages()");
//         getPackages((pacakgeErr, packageResults) => {
//             if (packageResults === "completed") {
//                 console.log("\nFunction getPackages has completed");
//                 console.log("Executing function getCheapSharkData()");
//                 getCheapSharkData((cheapSharkErr, cheapSharkResults) => {
//                     if (cheapSharkResults === "completed") {
//                         console.log("\nFunction getCheapSharkData() has completed");
//                     }
//                 });
//             }
//         });
//     }
// });
