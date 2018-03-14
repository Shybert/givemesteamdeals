// Label inside donut chart
Chart.pluginService.register({
    beforeDraw: function (chart) {
      if (chart.config.options.elements.center) {
        //Get ctx from string
        var ctx = chart.chart.ctx;
  
        //Get options from the center object in options
        var centerConfig = chart.config.options.elements.center;
        var fontStyle = centerConfig.fontStyle || 'Arial';
        var txt = centerConfig.text;
        var color = centerConfig.color || '#000';
        var sidePadding = centerConfig.sidePadding || 20;
        var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
        //Start with a base font of 30px
        ctx.font = "30px " + fontStyle;
  
        //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
        var stringWidth = ctx.measureText(txt).width;
        var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;
  
        // Find out how much the font can grow in width.
        var widthRatio = elementWidth / stringWidth;
        var newFontSize = Math.floor(30 * widthRatio);
        var elementHeight = (chart.innerRadius * 2);
  
        // Pick a new font size so it will not be larger than the height of label.
        var fontSizeToUse = Math.min(newFontSize, elementHeight);
  
        //Set font settings to draw it correctly.
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
        ctx.font = fontSizeToUse+"px " + fontStyle;
        ctx.fillStyle = color;
  
        //Draw text in center
        ctx.fillText(txt, centerX, centerY);
      }
    }
  });

// Get Steam rating data
const id = document.getElementsByTagName("body")[0].id;
console.log(`The ID is: ${id}`);
fetch(`/api/chart/${id}`)
    .then(res => res.json())
    .then((data) => {
        makeRatingChart(data);
        makePriceHistoryChart(data);
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

function makePriceHistoryChart(data) {
    const ctx = document.getElementById("priceHistoryCanvas").getContext("2d");
    const priceHistoryChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.labels,
            datasets: [{
                label: "Price",
                backgroundColor: "#388E3C",
                lineTension: 0,
                data: data.priceData,
            }],
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: data.highestPrice,
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

// TABS

function switchTabs(event, tab) {
    console.log("Switching to " + tab);
    console.log(event);

    var tabContent = document.getElementsByClassName("tabContent");
    for (let i = 0; i < tabContent.length; i += 1) {
        tabContent[i].style.display = "none";
    }
    var tabActive = document.getElementsByClassName("active");
    for (let i = 0; i < tabActive.length; i += 1) {
        tabActive[i].className = tabActive[i].className.replace(" active", "");
    }

    document.getElementById(tab).style.display = "block";
    event.currentTarget.className += " active";
}

// TRACK
var editButton = document.getElementById("trackButton");
var closeButton = document.getElementById("closeButton");

editButton.onclick = function () {
    document.getElementById("overlayWrapper").style.height = "100%";
};

closeButton.onclick = function () {
    document.getElementById("overlayWrapper").style.height = "0%";
}

