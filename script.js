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
var chosenActor;

var gameContainer = document.querySelector(".game-container")
var resultContainer = document.querySelector(".result")

var noOfCorrect = 0

gameContainer.classList.add("hide")
resultContainer.classList.add("hide")

//api request related stuff
function loadResponse(){
    var actorList = JSON.parse(this.response)
    actorShortList = []

    //only use actors who have an image
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
    optionNo = optionNumber.value

    if(optionNo > numberInput){
        alert("You can't have more options than the number of actors.")
    } else {
        var request = new XMLHttpRequest()
        request.open("GET", rootURL + "search/people?q=" + actorInput)
        request.addEventListener("load", loadResponse)
        request.send()
    }

})

//game functionality

//button function - submit answer
function submitAnswer(){
    //check if wrong or right, update answer
    if(checkRadioSelected(".radioButtons")){
        noOfCorrect++
        console.log(noOfCorrect)
    } else {
        console.log("No!")
    }
    //load new page
    if (actorShortList.length>0){
        initGameContainer()
    } else {
        initResultPage()
    }

}

function initResultPage(){
    resultContainer.innerHTML = ""
    gameContainer.classList.add("hide")
    console.log(nameImgList)
    nameImgList.forEach(function(item){
        var actorProfileContainer = document.createElement("div")
        var img = document.createElement("img")
        var caption = document.createElement("p")
        img.src = item.img
        caption.innerText = item.name
        actorProfileContainer.appendChild(img)
        actorProfileContainer.appendChild(caption)
        resultContainer.appendChild(actorProfileContainer)
    })

    var scoreString = document.createElement("p")
    scoreString.innerHTML = "You scored "+noOfCorrect+"/"+nameList.length+"."
    resultContainer.appendChild(scoreString)

    var playAgainButton = document.createElement("button")
    playAgainButton.innerHTML = "Play Again!"
    playAgainButton.addEventListener("click", function(){
        resultContainer.classList.add("hide")
        document.querySelector(".user-inputs").classList.remove("hide")
    })
    resultContainer.appendChild(playAgainButton)

    resultContainer.classList.remove("hide")
}


function loadGame(){
    document.querySelector(".user-inputs").classList.add("hide")

    //check and adjust list length
    if(actorShortList.length<numberInput){
        //some function for output - a)return array length. if < 4, vs if >=4 - continue or restart.
        console.log("list not long enough!")
    } else if (actorShortList.length>numberInput){
        while(actorShortList.length>numberInput){
            actorShortList.pop()
        }
        console.log(actorShortList)
    }

    //generate name list and name+image list
    actorShortList.forEach(function(item){
        nameList.push(item.person.name)
        nameImgList.push({
            name: item.person.name,
            img: item.person.image.medium
        })
    })

    //load game container elements
    initGameContainer()

    //unhide game-container
    gameContainer.classList.remove("hide")

}

function initGameContainer(){
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
    question.innerText = `Which ${actorInput} is this?`
    gameContainer.appendChild(question)

    //making and appending hint div
    var hint = document.createElement("div")
    gameContainer.appendChild(hint)

    //making the options div which will contain the radio options
    var allOptions = document.createElement("div")

    //making the radio option for the chosen actor
    makeRadioOptions("correctAnswer", chosenActor.person.name)

    //making radio options for 3 random other actors
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



function checkRadioSelected(classOfRadio){
    var RadioOptionsList = document.querySelectorAll(classOfRadio)
    for(i=0;i<RadioOptionsList.length;i++){
        if(RadioOptionsList[i].id=="correctAnswer"&&RadioOptionsList[i].checked){
            return true
        }
    }
    return false
}