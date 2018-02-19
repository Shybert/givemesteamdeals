console.log("Requesting generic data to set up rating chart");

// Get Steam rating data
const id = document.getElementsByTagName("body")[0].id;
console.log(`The ID is: ${id}`);
$(document).ready(() => {
    $.get(`/ratingdata/${id}`, (data) => {
        if (data === "noRating") {
            console.log("Needed data for rating chart missing");
        } else {
            console.log(`Rating data is: ${JSON.stringify(data)}`);
            makeRatingChart(data);
        }
    });
});

function makeRatingChart(data) {
    // Set to "Mixed" color, to start off
    let donutTextColor = "#ffa300";
    if (Number(data.steam_rating_percent) >= 70) {
        donutTextColor = "#0094ea";
    } else if (Number(data.steam_rating_percent) <= 39) {
        donutTextColor = "#e34600";
    }

    const ctx = document.getElementById("ratingCanvas").getContext("2d");
    const ratingChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Negative", "Positive"],
            datasets: [{
                label: "Rating Percentage",
                backgroundColor: ["#e34600", "#0094ea"],
                data: [data.steam_rating_negative, data.steam_rating_positive],
            }],
        },
        options: {
            elements: {
                center: {
                    text: data.steam_rating_percent + " %",
                    color: donutTextColor,
                },
            },
            legend: {
                display: false,
            },
        },
    });
}
