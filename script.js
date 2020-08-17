//global variables
var rootURL = "http://api.tvmaze.com/"

//input fields
var submitButton = document.querySelector("#submit")
var actorField = document.querySelector("#actor")
var actorInput;
var userNumber = document.querySelector("#number")
var numberInput;
var optionNumber = document.querySelector("#option-no")
var optionNo;

var actorShortList = []
var nameList = []
var nameImgList = []
var noOfCorrect = 0
var chosenActor;

var gameContainer = document.querySelector(".game-container")
var resultContainer = document.querySelector(".result")
var inputContainer = document.querySelector(".user-inputs")
var inputErrorContainer = document.querySelector(".inputerror-container")

gameContainer.classList.add("hide")
resultContainer.classList.add("hide")


//adding Event Listener to the submit button in user-inputs container
submitButton.addEventListener("click", function(){
    actorInput = actorField.value
    numberInput = userNumber.value
    optionNo = optionNumber.value

    if(optionNo > numberInput){
        returnError(-1)
    } else {
        var request = new XMLHttpRequest()
        request.open("GET", rootURL + "search/people?q=" + actorInput)
        request.addEventListener("load", loadResponse)
        request.send()
    }
})

//api request related stuff
function loadResponse(){
    var actorList = JSON.parse(this.response)
    loadGame(actorList)
}

//game functions

function loadGame(actorList){

    //reset all global variables
    actorShortList = []
    nameList = []
    nameImgList = []
    noOfCorrect = 0

    //only use actors who have an image
    actorList.forEach(function(actor, index){
        if(actor.person.image&&actor.person.image.medium){
            actorShortList.push(actor)
        }
    })

    //check and adjust list length
    if(actorShortList.length<numberInput){
        //some function for output - a)return array length. if < 4, vs if >=4 - continue or restart.
        returnError(actorShortList.length)
    } else {
        //reduce length of actorShortList until it matches the user request
        while(actorShortList.length>numberInput){
            actorShortList.pop()
        }
        //generate name list and name+image list
        actorShortList.forEach(function(item){
            nameList.push(item.person.name)
            nameImgList.push({
                name: item.person.name,
                img: item.person.image.medium
            })
        })
        //start the game
        initGameContainer()
    }

}

function returnError(listLength){
    inputErrorContainer.innerHTML = ""
    inputContainer.classList.add("hide")
    inputErrorContainer.classList.remove("hide")

    var errorMessage = document.createElement("div")

    var backButton = document.createElement("button")
        backButton.innerText = "Back"
        backButton.addEventListener("click", function(){
            inputErrorContainer.classList.add("hide")
            inputContainer.classList.remove("hide")
        })

    if(listLength==-1){
        errorMessage.innerText = `Number of options cannot exceed number of actors.`
        actorField.value = ""
        inputErrorContainer.appendChild(errorMessage)
        inputErrorContainer.appendChild(backButton)

    } else if (listLength<4){
        errorMessage.innerText = `Not enough actors named '${actorInput}'. Make your search less specific or type in a different name.`
        actorField.value = ""
        inputErrorContainer.appendChild(errorMessage)
        inputErrorContainer.appendChild(backButton)

    } else {
        errorMessage.innerText = `There are ${listLength} actors that match your search for '${actorInput}'. Click "Continue" to proceed with ${listLength} questions, or "Back" to go back to the start page.`

        var continueButton = document.createElement("button")
        continueButton.innerText = "Continue"

        actorShortList.forEach(function(item){
            nameList.push(item.person.name)
            nameImgList.push({
                name: item.person.name,
                img: item.person.image.medium
            })
        })

        //if they click continue and optionNo exceeds number of viable actors, optionNo is set to maximum ie number of actors
        if(optionNo > actorShortList.length){
            optionNo = actorShortList.length
        }
        continueButton.addEventListener("click", initGameContainer)

        inputErrorContainer.appendChild(errorMessage)
        inputErrorContainer.appendChild(backButton)
        inputErrorContainer.appendChild(continueButton)
    }

}


function initGameContainer(){
    inputErrorContainer.classList.add("hide")
    inputContainer.classList.add("hide")
    gameContainer.classList.remove("hide")

    gameContainer.innerHTML = ""
    var optionList = []

    //randomly select one from actorShortList
    var randomIndex = Math.floor(Math.random() * actorShortList.length)
    chosenActor = actorShortList[randomIndex]
    actorShortList.splice(randomIndex, 1) //after choosing, remove from array to avoid repeats

    //making and appending image of chosen actor
    var actorImg = document.createElement("img")
    actorImg.src = chosenActor.person.image.medium
    gameContainer.appendChild(actorImg)

    //making and appending question
    var question = document.createElement("h4")
    question.innerText = `Which '${actorInput}' is this?`
    gameContainer.appendChild(question)

    //making and appending hint div
    var hint = document.createElement("div")
    gameContainer.appendChild(hint)

    //making the options div which will contain the radio options
    var allOptions = document.createElement("div")

    //making the radio option for the chosen actor
    makeRadioOptions("correctAnswer", chosenActor.person.name)

    //making radio options for n-1 random other actors
    var i=0
    var takenNames = [chosenActor.person.name]
    while(i<optionNo-1){
        var randomIndex1 = Math.floor(Math.random()*nameList.length)
        var randomName = nameList[randomIndex1]
        if(!takenNames.includes(randomName)){
            makeRadioOptions(i, randomName)
            takenNames.push(randomName)
            i ++
        }
    }

    //appending the HTML options in random order to allOptions div
    var i = 0
    while(i<optionNo){
        var randomIndex2 = Math.floor(Math.random()*optionList.length)
        var actorOption = optionList[randomIndex2]
        allOptions.appendChild(actorOption[0])
        allOptions.appendChild(actorOption[1])
        allOptions.appendChild(document.createElement("br"))
        optionList.splice(randomIndex2, 1)
        i++
    }

    gameContainer.append(allOptions)

    var submitButton = document.createElement("button")
    submitButton.innerText = "Submit Answer"
    submitButton.addEventListener("click", submitAnswer)
    gameContainer.appendChild(submitButton)


    function makeRadioOptions(ID, name){
        var option = document.createElement("input")
        option.className = "radioButtons"
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

}

//button function - submit answer
function submitAnswer(){
    //check if wrong or right, update answer
    if(checkRadioSelected(".radioButtons")){
        noOfCorrect++
    }
    //load new page - if there are actors left, load game, else load results
    if (actorShortList.length>0){
        initGameContainer()
    } else {
        initResultPage()
    }
}

function checkRadioSelected(classOfRadio){
    var RadioOptionsList = document.querySelectorAll(classOfRadio)
    var checkedAnswer;
    for(i=0;i<RadioOptionsList.length;i++){
        if(RadioOptionsList[i].id=="correctAnswer"&&RadioOptionsList[i].checked){
            addClass("right", "You got it right!")
            return true
        } else if (RadioOptionsList[i].checked){
            checkedAnswer = RadioOptionsList[i].value
        }
    }
    addClass("wrong", "You guessed "+checkedAnswer+".")
    return false
}

function addClass(answer, guess){
    nameImgList.forEach(function(actor){
        if(actor.name===chosenActor.person.name){
            actor.class = answer
            actor.guess = guess
        }
    })
}

function initResultPage(){
    resultContainer.innerHTML = ""
    gameContainer.classList.add("hide")

    var scoreString = document.createElement("p")
    scoreString.className = "score"
    scoreString.innerHTML = "You scored "+noOfCorrect+"/"+nameList.length+"."
    resultContainer.appendChild(scoreString)

    var imageDiv = document.createElement("div")
    imageDiv.className = "result-images"

    nameImgList.forEach(function(item){
        var actorProfileContainer = document.createElement("div")

        var img = document.createElement("img")
        img.src = item.img

        var actorName = document.createElement("p")
        actorName.innerText = item.name

        var playerGuess = document.createElement("p")
        playerGuess.innerText = item.guess
        playerGuess.className = "guess"

        actorProfileContainer.appendChild(img)
        actorProfileContainer.appendChild(actorName)
        actorProfileContainer.appendChild(playerGuess)
        actorProfileContainer.classList.add(item.class)
        imageDiv.appendChild(actorProfileContainer)
    })

    resultContainer.appendChild(imageDiv)

    var playAgainButton = document.createElement("button")
    playAgainButton.innerHTML = "Play Again!"
    playAgainButton.addEventListener("click", function(){
        resultContainer.classList.add("hide")
        inputContainer.classList.remove("hide")
    })
    resultContainer.appendChild(playAgainButton)

    resultContainer.classList.remove("hide")
}