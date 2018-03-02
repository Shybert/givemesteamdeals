// Contains miscellanous functions used througout the app

const htmlparser = require("htmlparser2");
const rp = require("request-promise");

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

// Fetch a picture from steam
module.exports.getSteamPicture = async (id, obj) => {
    const sSteamLink = await rp(`http://store.steampowered.com/app/${id}`);
    console.log(sSteamLink);
};
