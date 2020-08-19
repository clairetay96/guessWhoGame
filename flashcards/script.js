//global variables
var rootURL = "https://api.nasa.gov/planetary/apod?"

//input fields
var submitButton = document.querySelector("#submit")
var gridField = document.querySelector("#grid")
var gridInput;
var questionNumber = document.querySelector("#number")
var numberInput;
var optionNumber = document.querySelector("#option-no")
var optionNo;

var APODList = []
var nameList = []
var nameImgList = []
var noOfCorrect = 0
var chosenPicture;

var gameContainer = document.querySelector(".game-container")
var resultContainer = document.querySelector(".result")
var inputContainer = document.querySelector(".user-inputs")
var inputErrorContainer = document.querySelector(".inputerror-container")

gameContainer.classList.add("hide")
resultContainer.classList.add("hide")

//adding Event Listener to the submit button in user-inputs container. Sets global variables.
submitButton.addEventListener("click", function(){
    gridInput = gridField.value
    numberInput = parseInt(questionNumber.value)
    optionNo = parseInt(optionNumber.value)

    //cannot have more options than number of questions
    if(optionNo > numberInput){
        returnError(-1)
    } else {
        var takenDates = []
        i = 0
        while(i<numberInput){
            var date = generateDate()
            if(!takenDates.includes(date)){
                var request = new XMLHttpRequest()
                request.open("GET", rootURL +`date=${date}&api_key=EYhKRIa35V54bUbqd3jreu6BNDfsmiPb07MLgoqD`, false)
                request.addEventListener("load", loadResponse)
                request.addEventListener("error", APIError)
                request.send()
                i++
            }

        }
      loadGame(APODList)
    }

})

gridField.addEventListener("keypress", keyPressEnter)
questionNumber.addEventListener("keypress", keyPressEnter)
optionNumber.addEventListener("keypress", keyPressEnter)


function keyPressEnter(event){
    if(event.keyCode === 13){
        submitButton.click()
    }
}

//generate random date beetween 2005-2015, between 1st and 25th inclusive of any month.
function generateDate(){
    var year = 2005 + Math.floor(Math.random()*11)
    var month = Math.ceil(Math.random()*12)
    if(month<10){
        month = "0" + month.toString()
    }
    var day = Math.ceil(Math.random()*25)
    if(day<10){
        day = "0" + day.toString()
    }
    return `${year}-${month}-${day}`
}

//occurs when error is encountered
function APIError(){
    alert("An error occurred.")
}

//when the api request is made, stores response from api in APODList
function loadResponse(){
    var APODObject = JSON.parse(this.response)
    APODList.push(APODObject)
}

//game functions

//loads the game - this function sets the list of actors that will be in the game
function loadGame(APODList){

    //reset all global variables
    nameList = []
    nameImgList = []
    noOfCorrect = 0

    //generate name list and name+image list
    APODList.forEach(function(item){
        nameList.push(item.title)
        nameImgList.push({
            name: item.title,
            explanation: item.explanation,
            img: item.url
        })
    })
    initGameContainer()
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
        errorMessage.innerText = `Number of options cannot exceed number of questions.`
        inputErrorContainer.appendChild(errorMessage)
        inputErrorContainer.appendChild(backButton)
    }

}

//loads the game page - runs once for each question
function initGameContainer(){
    inputErrorContainer.classList.add("hide")
    inputContainer.classList.add("hide")
    gameContainer.classList.remove("hide")

    gameContainer.innerHTML = ""
    var optionList = []

    //randomly select one from APODList
    var randomIndex = Math.floor(Math.random() * APODList.length)
    chosenPic = APODList[randomIndex]
    APODList.splice(randomIndex, 1) //after choosing, remove from array to avoid repeats

    //making and appending image of chosen APOD
    var imgDiv = document.createElement("div")
    imgDiv.className = "image-div"

    var APODImg = document.createElement("img")
    APODImg.id = "APOD-image"
    APODImg.style.height = "450px"
    APODImg.style.opacity = 0
    APODImg.onload = function(){
        var tileDiv = document.createElement("div")
        tileDiv.style.width = this.width + "px"
        tileDiv.style.height = this.height + "px"
        tileDiv.className = "tile-div"

        var noOfTiles = gridInput * gridInput
        var i = 0
        while (i<noOfTiles){
            var tile = document.createElement("div")
            tileDiv.appendChild(tile)
            var gaps = 3*gridInput
            tile.style.width = `calc(( 100% - ${gaps}px ) / ${gridInput})`
            tile.style.height = `calc(( 100% - ${gaps}px ) / ${gridInput})`
            tile.id = "tile" + i
            i ++
        }
        imgDiv.appendChild(tileDiv)
        setTimeout(function(){APODImg.style.opacity = 1}, 500)
        revealMore()
        revealMore()

    }

    APODImg.src = chosenPic.url
    imgDiv.appendChild(APODImg)

    gameContainer.appendChild(imgDiv)


    //making and appending question
    var question = document.createElement("h4")
    question.innerText = `Which picture is this?`
    gameContainer.appendChild(question)

    //making and appending "reveal more" button
    var hint = document.createElement("div")
    hint.className = "hint-container"

    var hintButton = document.createElement("button")

    hintButton.innerText = "Reveal more!"
    hintButton.addEventListener("click", revealMore)

    //randomly selects a tile and changes the tile opacity to 0. if the tile is already transparent, function is called recursively until opaque tile is found. If all tiles are transparent, click event listener is removed.
    function revealMore(){
        var randIndex = Math.floor(Math.random()*gridInput*gridInput)
        var randTile = document.querySelector("#" + "tile" + randIndex)
        var allTiles = document.querySelectorAll(".tile-div *")
        var allTilesClass = []
        for (i=0;i<allTiles.length;i++){
            allTilesClass.push(allTiles[i].classList.contains("transparent"))
        }
        if (!allTilesClass.includes(false)){
            this.removeEventListener("click", revealMore)
        } else if(!randTile.classList.contains("transparent")){
            randTile.classList.add("transparent")
        } else {
            revealMore()
        }
    }

    hint.appendChild(hintButton)
    gameContainer.appendChild(hint)

    //making the options div which will contain the radio options
    var allOptions = document.createElement("div")
    allOptions.className = "options-container"

    //making the radio option for the chosen picture
    makeRadioOptions("correctAnswer", chosenPic.title)

    //making radio options for n-1 random other titles
    var i=0
    var takenNames = [chosenPic.title]
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
        var pictureOption = optionList[randomIndex2]
        allOptions.appendChild(pictureOption[0])
        allOptions.appendChild(pictureOption[1])
        allOptions.appendChild(document.createElement("br"))
        optionList.splice(randomIndex2, 1)
        i++
    }

    gameContainer.append(allOptions)

    var submitButton = document.createElement("button")
    submitButton.innerText = "Submit Answer"
    submitButton.addEventListener("click", submitAnswer)
    gameContainer.appendChild(submitButton)


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
    if (APODList.length>0){
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

//loops through nameImgList to find chosenActor - stores whether the user got it right, and the guess.
function addClass(answer, guess){
    nameImgList.forEach(function(picture){
        if(picture.name===chosenPic.title){
            picture.class = answer
            picture.guess = guess
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
        var APODProfileContainer = document.createElement("div")

        var img = document.createElement("img")
        img.src = item.img
        img.style.width = "300px"

        var APODName = document.createElement("p")
        APODName.innerText = item.name

        var playerGuess = document.createElement("p")
        playerGuess.innerText = item.guess
        playerGuess.className = "guess"

        var explanation = document.createElement("p")
        explanation.innerText = item.explanation
        explanation.className = "guess"

        APODProfileContainer.appendChild(img)
        APODProfileContainer.appendChild(APODName)
        APODProfileContainer.appendChild(playerGuess)
        APODProfileContainer.classList.add(item.class) //"right" - green bg, "wrong" - red bg
        APODProfileContainer.appendChild(explanation)
        imageDiv.appendChild(APODProfileContainer)
    })

    resultContainer.appendChild(imageDiv)

    resultContainer.classList.remove("hide")
}