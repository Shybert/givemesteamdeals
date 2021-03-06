// Contains miscellanous functions used througout the app

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

// Checking track data
module.exports.checkTrackData = async (oTrackData) => {
    try {
        console.log("Checking track data");

        // Checks if price is a number and if it is lower/higher than 0/999.99
        console.log("Checking if price is valid");
        if (typeof oTrackData.price !== "number" || oTrackData.price < 0 || oTrackData.price > 999.99) {
            console.log("Invalid price");
            throw new Error("Invalid price, must be a number between 0 and 999.99");
        }
    } catch (err) {
        console.log("?");
        throw err;
    }
};
