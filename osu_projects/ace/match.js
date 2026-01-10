//const { contentType } = require("express/lib/response");

//stand in for the actual decks
let deck;
var cardArray2 = [
    { word: "muffler", def: "suppressor for car", }, 
    { word: "intake", def: "gets air into the engine", },
    { word: "exhaust", def: "throws out all the spent energy"}, 
    { word: "sparkplug", def: "ignites the fuel"}, 
    { word: "catalytic converter", def: "is a filter to get rid of all the toxic emissions"},
    { word: "nitrous oxide", def: "puts more air into the engine giving more power"},
];

let cardArrayOG = []
// The array we will be working with
let cardArray = []

var aniC = document.getElementsByClassName("aniCorrect")[0]
var wpool = document.getElementsByClassName("word-pool")[0]
var dpool = document.getElementsByClassName("def-pool")[0]
var counter = 0;
let firstnode;
let first, second;

//victory screen and objects
var victory = document.getElementsByClassName('words')
var backdrop = document.getElementById('backdrop')
var playagain = document.getElementById('play-again')
var againButton = document.getElementsByClassName('again')[0]

class card {
    constructor(word, def, key) {
        this.word = word;
        this.def = def;
        this.key = key;
    }
    getword() {
        return this.word;
    }
    getdef() {
        return this.def;
    }
}

function checkVictory() {
    var lost;
    for(var i=0; i<victory.length; i++) {
        if(!victory[i].classList.contains("correct")) {
            lost = true;
        }
    }
    if(lost != true) {
        toggle()
    }
}

//turns the victory modal on and off
function toggle() {
    if (backdrop.classList.contains("hidden")) {
        playagain.classList.remove('hidden')
        backdrop.classList.remove('hidden')
      }
    else {                                //replays game
        playagain.classList.add('hidden')
        backdrop.classList.add('hidden')
        for(var i=0; i<victory.length; i++) {
            victory[i].classList.remove('correct')
            victory[i].classList.remove('selected')
        }
        location.reload();    //refreshes page to rearrange words
    }
}

//called when user clicks words
function choose() {
    counter += 1;
    //console.log(counter)
    if(counter == 2) {
        second = this.getAttribute('value')
        if(first == second) {
            //alert("correct")
            firstnode.classList.add("correct")
            this.classList.add("correct")
            checkVictory()
        }
        else {
            //alert('wrong')
            firstnode.classList.remove("selected")
        }
        counter = 0;
    }
    else {
        if(this.classList.contains("selected")) {
            this.classList.remove("selected")
        }
        else {
            this.classList.add("selected")
        }
        firstnode = this
        first = this.getAttribute('value')
    }
}

//Setting up the game board
function createBoardW(wool, array) { 
    for(var i=0; i<array.length; i++) {
        var text = document.createTextNode(array[i].getword())
        
        var para = document.createElement('p')
        para.classList.add("words")
        para.appendChild(text)
        para.setAttribute("value", array[i].key)
        wool.appendChild(para)
    }
}
function createBoardD(dool, array) { 
    array.forEach((arr, index) => { 
        var text = document.createTextNode(arr.getdef())

        var para = document.createElement('p')
        para.classList.add("words")
        para.appendChild(text)
        para.setAttribute("value", arr.key)
        dool.appendChild(para)
    })
}

//randomizes the card placement
function arrangeCard() { 
    cardArray.sort(() => 0.5 - Math.random())
}


//copies the deck into a usuable card array
function arrcopy(cardArray) {
    for(var i=0; i<cardArrayOG.length; i++) {
        let piece = new card(cardArrayOG[i].word, cardArrayOG[i].def, i)
        cardArray.push(piece)
    }
}

//document.addEventListener('DOMContentLoaded', function() {
    //cardArrayOG = cardArray2
 
//})

async function main() {
    if(this.deck == undefined) {
        cardArrayOG = cardArray2
    }
    else {
        deck = this.deck
        cardArrayOG = deck.cards
    }
    arrcopy(cardArray)
    arrangeCard()
    createBoardW(wpool, cardArray)
    arrangeCard()
    createBoardD(dpool, cardArray)

    var letras = document.getElementsByClassName("words")
    for(var i=0; i<letras.length; i++) {
            letras[i].addEventListener('click', choose)
    }
    againButton.addEventListener('click', toggle)
}
main();