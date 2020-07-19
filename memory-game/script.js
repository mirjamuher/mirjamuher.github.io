// Definitions

const elGame = document.querySelector('#game');
const elStartButton = document.querySelector('#startButton');
const elSlider = document.querySelector('#slider')

let nPairs; // do I need this?
let elBacks;
let elCards;
let elTDs; 


// Press Start Button

function pressStart () {
    elGame.classList.remove('noDisplay');
    const nPairs = elSlider.value;  
    const isFamily = location.search == "?mode=family";  // TODO make this come from MAGIC.
    console.log("isFamily is", isFamily);
    let pictures = generatePictures(nPairs, isFamily); //number fed in by slider, Boolean determines if family pics or not
    shuffleArray(pictures);
    console.log(pictures);
    createTable(pictures);
    elBacks = document.querySelectorAll('.back')
    elCards = document.querySelectorAll('.card');
    elTDs = document.querySelectorAll('td');
    for (const elTD of elTDs) {
        elTD.addEventListener("click", clickCard);
    }
    document.querySelector("#inputConditions").classList.add("noDisplay")
}

elStartButton.addEventListener("click", pressStart);


// Clicking button randomly assigns one picture to two cards
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// construct list of pictures
function generatePictures (nPairs, isFamily) {
    let pictures = [];
    let prefix = "pic";
    if (isFamily) {
        prefix = "fam";
    }
    for (let i = 0; i < nPairs; i++) {
        pictures.push(prefix + (i+1));
        pictures.push(prefix + (i+1));
    }
    return pictures;
}

/**
 * Takes a given number and returns a 2-element list of two numbers; the largest two numbers that
 * multiply together to form n.
 * @param {number} n 
 * @returns {number}
 */
function closestDivisors(n) {
    let a = Math.round(Math.sqrt(n));
    while (n % a > 0) {
        a -= 1;
    }
    return [a, Math.floor(n/a)];
}

// build table 
function createTable (pictures) {
    // We generate the number of rows and columns by using `closestDivisors` on the number of cards
    // we want to place on the screen.
    const [maxRows, maxCols] = closestDivisors(pictures.length);
    const gameStart = document.getElementById('game');
    const pictureTable = document.createElement('table');
    let i = 0;
    for (let r = 0; r < maxRows; r++) {
        let elRow = document.createElement("tr");
        for (let c = 0; c < maxCols; c++) {
            let elCell = document.createElement("td");
            assignPicture(elCell, i, pictures);
            elRow.appendChild(elCell);
            i ++;
        }
        pictureTable.appendChild(elRow);
    }
    gameStart.appendChild(pictureTable);
}

function assignPicture (elCell, i, pictures) {
    let div1 = document.createElement('div');
    const pictureName = pictures[i];
    div1.classList.add(pictureName);
    div1.setAttribute('data-picture', pictureName);
    div1.classList.add('card');
    div1.classList.add('noDisplay');
    let div2 = document.createElement('div');
    div2.classList.add('back');
    div2.classList.add('revealed');

    elCell.appendChild(div1);
    elCell.appendChild(div2);
}



// Clicking toggles between back and front of card
function revealCard (td) {
    const elDivs = td.querySelectorAll("div");
    for (const elDiv of elDivs) {
        elDiv.classList.toggle('noDisplay');
        elDiv.classList.toggle('revealed');
    }
    comparePic (td);
}


// When you click the card function

function clickCard (event) {
    const clickedTD = event.currentTarget;
    if (clickedTD.querySelector(".card.revealed")) { // if card is revealed, clicking it again is impossible
        return;
    }
    // check if already 2 to make invalidClick, if not revealCard
    const backNoDisplayList = [];
    // This loop has equivalent logic to the following CSS selector:
    // backNoDisplayList = document.querySelectorAll('td:not([data-solved=true]) > .back.noDisplay');
    for (const elBack of elBacks) {
        if (!elBack.parentNode.hasAttribute('data-solved') && elBack.classList.contains('noDisplay')) { // makes sure td doesn't have data-solved
            backNoDisplayList.push(elBack);
        }
    };
    console.log(backNoDisplayList);
    if (backNoDisplayList.length == 2) {
        invalidClick();
    } else {
        revealCard(clickedTD);
        checkForWin();
    }
};


// only two can be selected

function invalidClick() {
    for (const elCard of elCards) {
        if (!elCard.parentNode.hasAttribute('data-solved')) { // makes sure td doesn't have data-solved
            elCard.classList.add('noDisplay')
            elCard.classList.remove('revealed')
        }
    }
    for (const elBack of document.querySelectorAll('.back')) {
        if (!elBack.parentNode.hasAttribute('data-solved')) { // makes sure td doesn't have data-solved
            elBack.classList.remove('noDisplay')
            elBack.classList.add('revealed')
        }
    }
}

// timed solution for when 2 are revealed:
/*
function sayHello() {
    console.log('hello!');
}
setTimeout(sayHello, 1000);
*/

// If already two td>div>back in the id=table have the nodisplay then no more can be clicked
// later: if two of the same type have been revealed, the nodisplay gets removed and they get added a new class
function comparePic (td) {
    const elCurrentCard = td.querySelector('div.card');
    const elCurrentCardPic = elCurrentCard.getAttribute('data-picture');
    const elRevealedCards = document.querySelectorAll('.card.revealed[data-picture=' + elCurrentCardPic +']');

    if (elRevealedCards.length == 2) {
        for (const elCard of elRevealedCards) {
            const cardParent = elCard.parentNode;
            cardParent.setAttribute('data-solved', 'true');
        }
    }
}

// Make confetti rain when game is done

function checkForWin () {
    const cardNo = document.querySelectorAll(".card").length;
    const solvedNo = document.querySelectorAll("td[data-solved=true]").length;
    if (cardNo == solvedNo) {
        confetti.start(10000);
    }
}