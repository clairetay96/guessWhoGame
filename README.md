# guessWhoGame

SEI 24 Project #1 - The Game

This game is a MCQ quiz game that bases questions on information retrieved via APIs. In the parent directory, the API requested is the TVMaze API and the quiz has players guessing which actor is which. In the 'flashcard' directory, the code has been altered to call on the NASA Astronomy Picture of the Day (APOD) API and has the player guess which title matches which picture. The number of question and number of options available are user inputs for both.

I chose this project because I wanted to get more familiar with APIs. These projects only require a simple XML Http Request, but I did learn about the asynchronicity of such requests. To work around those I used async=false, which apparently is a deprecated method - this can likely be improved.

While both games have a customised hint function (reveals actor information by making more API requests for the TVmaze version, reveals more of the photo for the APOD version), this game is basically a kind of multiple-choice flashcard quiz - maybe it could be generalised further for any API, or take in user inputs for questions and answers. In which case, an open-ended quiz (vs multiple-choice) could also be made an option.

Overall a fun project. It's not the most interesting game but, you know, flashcards. Timeless.