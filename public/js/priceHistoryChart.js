console.log("Requesting price history data for setting up a chart");

// Get Steam Price History data
const idPrice = document.getElementsByTagName("body")[0].id;
console.log(`The ID is: ${idPrice}`);
$(document).ready(() => {
    $.get(`/chart/${idPrice}`, (data) => {
        console.log(`Price history data is: ${JSON.stringify(data)}`);
        parsePriceHistoryData(data);
    });
});

function parsePriceHistoryData(data) {
    const priceObj = {
        priceHistory: {
        },
        saleHistory: {
        },
    };

    const priceHistoryObj = data.priceHistory;
    const labels = [];
    const parsedPriceHistoryData = [];
    let highestPrice = 0;

    // Setting up the correct current date
    const currentDate = getCurrentDate();

    for (let i = 0; i < priceHistoryObj.length; i += 1) {
        labels.push(priceHistoryObj[i].start_date.substr(0, 10));
        parsedPriceHistoryData.push(priceHistoryObj[i].price);

        if (i === priceHistoryObj.length - 1) {
            // Set up price for today
            labels.push(currentDate);
            parsedPriceHistoryData.push(priceHistoryObj[i].price);
            if (priceHistoryObj[i].price > highestPrice) {
                highestPrice = priceHistoryObj[i].price;
            }
        }
    }
    console.log(labels);
    console.log(parsedPriceHistoryData);

    // Multiply highest price by 2, to get a good looking chart
    highestPrice *= 2;

    priceObj.priceHistory.labels = labels;
    priceObj.priceHistory.data = parsedPriceHistoryData;
    console.log(priceObj);
    makePriceHistoryChart(priceObj, highestPrice);
}

function makePriceHistoryChart(data, highestPrice) {
    const ctx = document.getElementById("priceHistoryCanvas").getContext("2d");
    const priceHistoryChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.priceHistory.labels,
            datasets: [{
                label: "Price",
                backgroundColor: "#748023",
                lineTension: 0,
                data: data.priceHistory.data,
            }],
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: highestPrice,
                    },
                }],
            },
        },
    });
}

function getCurrentDate() {
    const dateNow = new Date(Date.now());
    const year = dateNow.getUTCFullYear();

    let month = dateNow.getUTCMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }

    let date = dateNow.getUTCDate();
    if (date < 10) {
        date = "0" + date;
    }

    return `${year}-${month}-${date}`;
}
