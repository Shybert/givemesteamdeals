// Contains miscellanous functions used througout the app

const htmlparser = require("htmlparser2");
const rp = require("request-promise");
const tough = require("tough-cookie");

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
module.exports.shuffleArray = async (array) => {
    try {
        console.log("Shuffling array");
        const aBeingShuffled = array;

        for (let i = aBeingShuffled.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [aBeingShuffled[i], aBeingShuffled[j]] = [aBeingShuffled[j], aBeingShuffled[i]];
        }

        return (await Promise.all(aBeingShuffled));
    } catch (err) {
        console.error(`Error while shuffling array: ${err}`);
    }
};

// Logging function to make including the id easier
module.exports.log = async (id, message) => {
    try {
        console.log(`ID#${id}: ${message}`);
    } catch (err) {
        console.error(`Error with custom log function: ${err}`);
    }
};

// Generate range of dates
// https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
Date.prototype.addDays = function(days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

module.exports.getDateRange = async (startDate, stopDate) => {
    const dateArray = [];
    let currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date(currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
};

// // Fetch a picture from steam
// module.exports.getSteamPicture = async (id, obj) => {
//     try {
//         const cookie = new tough.Cookie({
//             birthtime: "283993201",
//             mature_content: "1",
//         });

//         const cookiejar = rp.jar();
//         cookiejar.setCookie(cookie, `http://store.steampowered.com/app/${id}`);

//         const oSteamLink = {
//             uri: `http://store.steampowered.com/app/${id}`,
//             jar: cookiejar,
//         };

//         // console.log("Fetching Steam picture, getting HTML");
//         // const oSteamLink = {
//         //     uri: `http://store.steampowered.com/app/${id}`,
//         //     jar: new tough.Cookie({birthtime: "283993201", mature_content: "1"})
//         // }
//         const sSteamLink = await rp(oSteamLink);
//         console.log(sSteamLink);

//         const parser = new htmlparser.Parser({
//             onopentag: (name, attribs) => {
//                 if (attribs.class === "screenshot_holder") {
//                     console.log(attribs);
//                 }
//             },
//         });
//         console.log("Parsing HTML");
//         parser.write(sSteamLink);
//         // parser.end();
//     } catch (err) {
//         console.error(`Error while getting steam picture: ${err}`);
//     }
    
// };
