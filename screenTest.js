let amountOfPrints = 0;

setInterval(print, 2000);

function print() {
    console.log(`Amount of prints: ${amountOfPrints}`);
    amountOfPrints += 1;
}
