var id = document.getElementsByTagName("body")[0].id;
var editButton = document.getElementById("editButton");
var closeButton = document.getElementById("closeButton");

editButton.onclick = function () {
    document.getElementById("overlayWrapper").style.height = "100%";
};

closeButton.onclick = function () {
    document.getElementById("overlayWrapper").style.height = "0%";
}
