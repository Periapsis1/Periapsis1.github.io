let deck = {
    "cards":[
        {
            "word": "Archaeology",
            "def": "Study of past peoples and cultures through analysis of material remains."
        },
        {
            "word": "Evolution",
            "def": "A change in allele frequency in the population over time."
        },
        {
            "word": "Gene",
            "def": "Sequence of nucleotides in DNA located on chromosomes and basic unit of inheritance."
        },
        {
            "word": "Ethnology",
            "def": "the study of sociocultural differences and similarities"
        },
        {
            "word": "Hominid",
            "def": "member of hominid family; any fossil or living human, chimp, or gorilla"
        },
        {
            "word": "Subculture",
            "def": "\ndifferent cultural traditions associated with subgroups in the same complex society"
        },
        {
            "word": "Language",
            "def": "primary means of human communication, spoken and written"
        },
        {
            "word": "Ethnicity",
            "def": "identification with an ethnic group"
        },
        {
            "word": "Stratified",
            "def": "class-structured, with differences in wealth, prestige, and power"
        },
        {
            "word": "Nation",
            "def": "society sharing a language, religion, history, territory, ancestry, and kinship"
        }
    ]
};
var cards;
var curCard = 0;
var term;
var hint;

var answer;
var numGuess;
var guess;
var curRow;
var activeGameTiles;
var keyboardTiles = document.getElementsByClassName("keyboard-tile");
var won;

//create game tiles based on answer length
var container = document.getElementsByClassName("game-guess-container");
const rows = ['row1', 'row2', 'row3'];

//fills in the guess container and resets game values
function createBoard(){
    cards = deck.cards;
    numGuess = 0;
    guess = "";
    curRow = "row1";
    term = cards[curCard].word;
    hint = cards[curCard].def;
    answer = term.toUpperCase();
    won = false;

    for(var i=0; i < answer.length; i++) {
        for(var j=0; j < 3; j++) {
            //create text node to hold guess letter
            var text = document.createTextNode('');
            
            //create paragraph to attach text node to
            var para = document.createElement('p');
            para.classList.add("game-tile-letter");
            para.appendChild(text);

            //create div
            var div = document.createElement('div');
            div.classList.add("game-tile");
            div.classList.add(rows[j]);
            div.appendChild(para);
            
            //append div
            container[0].appendChild(div);  
        } 
    }
        //append hint text node
        var hintContainer = document.getElementsByClassName("game-hint");
        var hintTextNode = document.createTextNode(hint);
        hintContainer[0].appendChild(hintTextNode);  
        activeGameTiles = document.getElementsByClassName(curRow);

}

//displays the pending guess in tiles
function display(str) {
    for(var i = 0; i < answer.length; i++){
        var gameTile = activeGameTiles[i].firstChild; //saves typing
        //remove any text in game tiles
        if(gameTile.hasChildNodes()){
            gameTile.removeChild(gameTile.firstChild);
        }
        //add text to game tiles
        if(str[i]){
            var text = document.createTextNode(str[i]);
            gameTile.appendChild(text);
        }
    }
}

//highlights keyboard tile
function keyboardHighlight(char, color) {
    //for each game tile
    for(var i = 0; i < keyboardTiles.length; i++) {
        if(keyboardTiles[i].firstChild.textContent === char) {
            //if tile is green, do not update
            if(keyboardTiles[i].style["background-color"] === '#46E72D') {
                return;
            }
            else {
                //if tile is not green and needs to be green or yellow, update color
                if(color === '#46E72D' || color === 'yellow') {
                    keyboardTiles[i].style["background-color"] = color;
                }
                //only make tile gray if it is not already yellow
                if(color === 'gray') {
                    if(keyboardTiles[i].style["background-color"] === 'yellow') {
                        return;
                    }
                    else {
                        keyboardTiles[i].style["background-color"] = 'gray';
                    }
                }
            }
        }
    }
}

//colors tiles when a guess is submitted
function highlight(row) {
    activeGameTiles = document.getElementsByClassName(row);
    //for each game tile
    for(var j = 0; j < activeGameTiles.length; j++) {
        //if letter in guess matches answer, highlight green
        if(activeGameTiles[j].firstChild.textContent === answer[j]){
            activeGameTiles[j].style["background-color"] = '#46E72D';
            keyboardHighlight(answer[j], '#46E72D');
        }
        //if letter in guess does not match the answer
        else {
            //if letter exists elsewhere in the word, highlight yellow
            //otherwise, highlight gray
            var flag = false;
            for(var k = 0; k < answer.length; k++) {
                if(activeGameTiles[j].firstChild.textContent === answer[k]) {
                    flag = true;
                    break;
                }
            }
            if(flag){
                activeGameTiles[j].style["background-color"] = 'yellow';
                keyboardHighlight(activeGameTiles[j].firstChild.textContent, 'yellow');
            }
            else {
                activeGameTiles[j].style["background-color"] = 'gray';
                keyboardHighlight(activeGameTiles[j].firstChild.textContent, 'gray');
            }
        }
    }
}

function checkGuess(){
    var flag = true;
    for(var i=0; i<answer.length; i++){
        if(activeGameTiles[i].style["background-color"] !== "rgb(70, 231, 45)"){
            flag = false;
        }
    }
    won = flag;
}

//listen for typing
document.onkeydown = function(e) { 
    if(numGuess < 3) {
        e = e || window.event;
        var key = e.key;
        //move to next word when right arrow is pressed
        if(key === 'ArrowRight'){
            curCard < cards.length-1 ? curCard++ : curCard = 0;
            nextWord(); 
        }
        //move to previous word when left arrow is pressed
        if(key === 'ArrowLeft'){
            curCard < cards.length-1 ? curCard++ : curCard = 0;
            nextWord();
        }
        //if user gussed word, do nothing with keyboard input
        if(won){
            return;
        }
        //erase key
        if (key === 'Backspace') {
            guess = guess.slice(0, -1);
        }
        //if user submits guess, highlight, check for win, and increment guess counter
        if (key === 'Enter') {
            if(guess && guess.length === answer.length){
                //highlight tiles
                highlight(curRow);
                
                //check for win
                checkGuess();
                
                //neither win or lose
                //move to next row
                numGuess++;
                numGuess === 1 ? curRow = "row2" : curRow = "row3";
                activeGameTiles = document.getElementsByClassName(curRow);
                
                //delete guess, unless on final submission
                numGuess === 3 ? guess = guess : guess = "";
            }
        }
        //add letter to guess area
        else if(key.length === 1 && guess.length < answer.length) {
            guess += key.toUpperCase();
        }
        display(guess);
    }
};

//resets the game area
function nextWord(){
    //remove game tile divs
    while(container[0].firstChild !== null){
        container[0].removeChild(container[0].firstChild);
    }
    //reset keyboard tile colors
    for(var i=0; i<keyboardTiles.length; i++){
        keyboardTiles[i].style["background-color"] = "#DBDBDB";
    }
    //remove hint
    var hintContainer = document.getElementsByClassName("game-hint");
    hintContainer[0].removeChild(hintContainer[0].firstChild);
    
    //create board with new word
    createBoard();
}

//when next word button is pressed, move to next word
var nextWordButton = document.getElementById("next-word-button");
nextWordButton.addEventListener("click", function() {
    //move to next card or loop back to first card
    curCard < cards.length-1 ? curCard++ : curCard = 0;
    nextWord();
    this.blur();
})

//when prev word button is pressed, move to next word
var prevWordButton = document.getElementById("prev-word-button");
prevWordButton.addEventListener("click", function() {
    //move to prev card or loop to first card
    curCard = 0 ? curCard-- : curCard = cards.length-1;
    nextWord();
    this.blur();
})

async function main() {
    createBoard();
}

main();