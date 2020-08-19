//the API requested
var rootURL = "http://api.tvmaze.com/"

//input fields and respective global variables
var submitButton = document.querySelector("#submit")
var actorField = document.querySelector("#actor")
var actorInput;
var userNumber = document.querySelector("#number")
var numberInput;
var optionNumber = document.querySelector("#option-no")
var optionNo;

//global variables
var actorShortList = [] //stores actor objects that will be used in quiz
var nameList = [] //stores actors names (strings) that will be used in quiz
var nameImgList = [] //stores actors names, images, will also store whether they were guessed right
var noOfCorrect = 0 //tracks number of correct answers
var chosenActor; //actor object whose image is shown - changes for every question

//HTML DOM Elements
var gameContainer = document.querySelector(".game-container")
var resultContainer = document.querySelector(".result")
var inputContainer = document.querySelector(".user-inputs")
var inputErrorContainer = document.querySelector(".inputerror-container")

gameContainer.classList.add("hide")
resultContainer.classList.add("hide")

//adding Event Listener to the submit button in user-inputs container. Sets global variables.
submitButton.addEventListener("click", function(){
    actorInput = actorField.value
    numberInput = parseInt(userNumber.value)
    optionNo = parseInt(optionNumber.value)

    //cannot have more options than number of actors
    if(optionNo > numberInput){
        returnError(-1)
    } else {
        var request = new XMLHttpRequest()
        request.open("GET", rootURL + "/search/people?q=" + actorInput)
        request.addEventListener("load", loadResponse)
        request.addEventListener("error", APIError)
        request.send()
    }
})

//pressing enter also a valid way to receive inputs instead of having to click submitButton
actorField.addEventListener("keypress", keyPressEnter)
userNumber.addEventListener("keypress", keyPressEnter)
optionNumber.addEventListener("keypress", keyPressEnter)

function keyPressEnter(event){
    if(event.keyCode === 13){
        submitButton.click()
    }
}

//occurs when error is encountered
function APIError(){
    alert("An error occurred.")
}

//when the api request is made, stores response from api and loads into game function
function loadResponse(){
    var actorList = JSON.parse(this.response)
    loadGame(actorList)
}

//game functions

//loads the game - this function sets the list of actors that will be in the game
function loadGame(actorList){

    //reset all global variables
    actorShortList = []
    nameList = []
    nameImgList = []
    noOfCorrect = 0

    //only use actors who have an image
    actorList.forEach(function(actor){
        if(actor.person.image&&actor.person.image.medium){
            actorShortList.push(actor)
        }
    })

    //check and adjust list length
    if(actorShortList.length<numberInput){
        //if the list is too short, give player option to continue or not.
        returnError(actorShortList.length)
    } else {
        //if list is too long, reduce length of actorShortList until it matches the user request
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

//this function determines paths when user input is invalid (ie option no > actor no) or when API results cannot match user request
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

//loads the game page - runs once for each question
function initGameContainer(){
    inputErrorContainer.classList.add("hide")
    inputContainer.classList.add("hide")
    gameContainer.classList.remove("hide")

    gameContainer.innerHTML = ""
    var optionList = []
    var castCreditList = []
    var showName;

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
    hint.className = "hint-container"

    var hintText = generateHint(chosenActor)
    var hintButton = document.createElement("button")

    hintButton.innerText = "Reveal hint!"
    hintButton.addEventListener("click", function(){
        document.querySelector(".hint-container").innerHTML = hintText
    })

    hint.appendChild(hintButton)
    gameContainer.appendChild(hint)

    //making the options div which will contain the radio options
    var allOptions = document.createElement("div")
    allOptions.className = "options-container"

    //making the radio option for the chosen actor
    makeRadioOptions("correctAnswer", chosenActor.person.name)

    //making radio options for n-1 random other actors
    var i=0
    var takenNames = [chosenActor.person.name]
    while(i<optionNo-1){
        var randomIndex1 = Math.floor(Math.random()*nameList.length)
        var randomName = nameList[randomIndex1]
        if(!takenNames.includes(randomName)){
            var elementID = "incorrect" + i.toString()
            makeRadioOptions(elementID, randomName)
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

    //generates hint by looking for actor's cast credits, or their country/birthday
    function generateHint(actorObj){
        var castCreditRequest = new XMLHttpRequest()
        castCreditRequest.open("GET", rootURL + "people/" + chosenActor.person.id  + "/castcredits", false)
        castCreditRequest.addEventListener("load", function(){
            castCreditList = JSON.parse(this.response)
        })
        castCreditRequest.addEventListener("error", APIError)
        castCreditRequest.send()

        if(castCreditList.length>0){
            showNameRequest = new XMLHttpRequest
            showNameRequest.open("GET", castCreditList[0]._links.show.href, false)
            showNameRequest.addEventListener("load", function(){
                showName = JSON.parse(this.response)
            })
            showNameRequest.addEventListener("error", APIError)
            showNameRequest.send()
            return `This actor was on the main cast of '${showName.name}'.`
        } else if (actorObj.person.country){
            return `This actor is from ${actorObj.person.country.name}.`
        } else if (actorObj.person.birthday) {
            return `This actor was born on ${actorObj.person.birthday}.`
        } else {
            return `No hint available - sorry!`
        }
    }

    //makes radio options with unique IDs for each question page, stores the option HTML elements in optionList
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
        //add ability to click on the label to select an option, not just radio button
        label.addEventListener("click", function(){
            document.querySelector("#" + ID).checked = true
        })

        var radioOptionObj = [option, label]

        optionList.push(radioOptionObj)
    }

}

//button function - submit answer
function submitAnswer(){
    //check if wrong or right, update score count
    if(checkRadioSelected(".radioButtons")){
        noOfCorrect++
    }
    //load new page - if there are actors left in actorShortList, load game, else load results
    if (actorShortList.length>0){
        initGameContainer()
    } else {
        initResultPage()
    }
}

//checks if selected option is correct, stores whether answer was right/wrong and what the wrong guess was
function checkRadioSelected(classOfRadio){
    var RadioOptionsList = document.querySelectorAll(classOfRadio)
    for(i=0;i<RadioOptionsList.length;i++){
        if(RadioOptionsList[i].id=="correctAnswer"&&RadioOptionsList[i].checked){
            addClass("right", "You got it right!")
            return true
        } else if (RadioOptionsList[i].checked){
            var checkedAnswer = RadioOptionsList[i].value
        }
    }
    addClass("wrong", "You guessed "+checkedAnswer+".")
    return false
}

//loops through nameImgList to find chosenActor - stores whether the user got it right, and the wrong guess.
function addClass(answer, guess){
    nameImgList.forEach(function(actor){
        if(actor.name===chosenActor.person.name){
            actor.class = answer
            actor.guess = guess
        }
    })
}

//generates the result page
function initResultPage(){
    resultContainer.innerHTML = ""
    gameContainer.classList.add("hide")

    var scoreString = document.createElement("p")
    scoreString.className = "score"
    scoreString.innerHTML = "You scored "+noOfCorrect+"/"+nameList.length+"."
    resultContainer.appendChild(scoreString)

    var playAgainButton = document.createElement("button")
    playAgainButton.innerHTML = "Play Again!"
    playAgainButton.addEventListener("click", function(){
        resultContainer.classList.add("hide")
        inputContainer.classList.remove("hide") //brings back the start page
    })
    resultContainer.appendChild(playAgainButton)

    var imageDiv = document.createElement("div")
    imageDiv.className = "result-images"

    //show all actors name, image, whether the user got it right, and user's guess
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
        actorProfileContainer.classList.add(item.class) //"right" - green bg, "wrong" - red bg
        imageDiv.appendChild(actorProfileContainer)
    })

    resultContainer.appendChild(imageDiv)

    resultContainer.classList.remove("hide")
}