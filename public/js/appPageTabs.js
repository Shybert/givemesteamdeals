$(document).ready(function() {
    $("#genericInfo").css("height", $("#rating").height());
});

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
