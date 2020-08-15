//global variables
var rootURL = "http://api.tvmaze.com/"

//input fields
var submitButton = document.getElementById("submit")
var actorField = document.getElementById("actor")
var actorInput;
var userNumber = document.querySelector("#number")
var numberInput;

var actorShortList = []
var nameList = []

var gameContainer = document.querySelector(".game-container")
var resultContainer = document.querySelector(".result")
var optionList = []

var noOfCorrect = 0

gameContainer.classList.add("hide")
resultContainer.classList.add("hide")

//api request related stuff
function loadResponse(){
    var actorList = JSON.parse(this.response)
    actorShortList = []
    actorList.forEach(function(actor, index){
        if(actor.person.image&&actor.person.image.medium){
            actorShortList.push(actor)
        }
    })
    loadGame()
}

submitButton.addEventListener("click", function(){
    actorInput = actorField.value
    numberInput = userNumber.value
    var request = new XMLHttpRequest()
    request.open("GET", rootURL + "search/people?q=" + actorInput)
    request.addEventListener("load", loadResponse)
    request.send()
})

//game functionality

//button function - submit answer
function submitAnswer(){
    //check if wrong or right, update answer
    //load new page
    if (actorShortList.length>0){
        initGameContainer()
    } else {
        initResultPage()
    }

}

function initResultPage(){
    resultContainer.innerHTML = "Game Over"
    resultContainer.classList.remove("hide")
}


function loadGame(){
    document.querySelector(".user-inputs").classList.add("hide")

    //check and adjust list length
    if(actorShortList.length<numberInput){
        //some function for output
        console.log("list not long enough!")
    } else if (actorShortList.length>numberInput){
        while(actorShortList.length>numberInput){
            actorShortList.pop()
        }
        console.log(actorShortList)
    } else {
        console.log("All good, proceed!")
    }

    //generate name list
    actorShortList.forEach(function(item){
        nameList.push(item.person.name)
    })

    //load game container elements
    initGameContainer()

    //unhide game-container
    document.querySelector(".game-container").classList.remove("hide")

}

function initGameContainer(){
    gameContainer.innerHTML = ""
    optionList = []

    //random select one from actorShortList
    var randomIndex = Math.floor(Math.random() * actorShortList.length)
    var chosenActor = actorShortList[randomIndex]
    actorShortList.splice(randomIndex, 1)

    var actorImg = document.createElement("img")
    actorImg.src = chosenActor.person.image.medium
    gameContainer.appendChild(actorImg)

    var question = document.createElement("h4")
    question.innerText = `Which ${actorInput} is this?`
    gameContainer.appendChild(question)

    var hint = document.createElement("p")
    gameContainer.appendChild(hint)

    var allOptions = document.createElement("div")

    makeRadioOptions("correctAnswer", chosenActor.person.name)
    console.log("option List is: ", optionList)

    var i=0
    var takenNames = [chosenActor.person.name]
    while(i<3){
        var randomIndex1 = Math.floor(Math.random()*nameList.length)
        var randomName = nameList[randomIndex1]
        if(!takenNames.includes(randomName)){
            makeRadioOptions(i, randomName)
            takenNames.push(randomName)
            i ++
        }
    }

    var i = 0
    while(i<4){
        var randomIndex2 = Math.floor(Math.random()*optionList.length)
        var actorOption = optionList[randomIndex2]
        allOptions.appendChild(actorOption[0])
        allOptions.appendChild(actorOption[1])
        optionList.splice(randomIndex2, 1)
        i++
    }

    gameContainer.append(allOptions)

    var submitButton = document.createElement("button")
    submitButton.innerText = "Submit Answer"
    submitButton.addEventListener("click", submitAnswer)
    gameContainer.appendChild(submitButton)

}

function makeRadioOptions(ID, name){
    var option = document.createElement("input")
    option.type = "radio"
    option.name = "options"
    option.value = name
    option.id = ID

    var label = document.createElement("label")
    label.for = ID
    label.innerText = name

    var radioOptionObj = [option, label]

    optionList.push(radioOptionObj)
}