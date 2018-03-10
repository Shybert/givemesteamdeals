var editButton = document.getElementById("trackButton");
var closeButton = document.getElementById("closeButton");

editButton.onclick = function () {
    document.getElementById("overlayWrapper").style.height = "100%";
};

closeButton.onclick = function () {
    document.getElementById("overlayWrapper").style.height = "0%";
}
