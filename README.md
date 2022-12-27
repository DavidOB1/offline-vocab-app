# Offline Vocab

This app allows users to download study sets off of Quizlet to a local database which then allows them to study those terms while offline, being useful 
in situations where the user may be somewhere without a stable connection yet wants to be productive. The app also uses a variation of the Spaced Repition System
in order to optomize how often users are studying certain terms. 

## Importing and Viewing Decks

<img src="https://i.ibb.co/zQSvSr9/IMG-5223.jpg" align="left" width=25%>
<img src="https://i.ibb.co/VSST6dS/IMG-5224.jpg" align="right" width=25%> 

### Importing

To import a deck, simply enter the URL of a valid Quizlet set, and enter the name you would like to store the new deck under. Make sure that the link you paste directs
to the main flashcards page of the Quizlet set. Using Quizlet's built-in share link feature for this will work.

### Viewing

You can then navigate to the Study tab and find the new deck that was created. Clicking on it will show all the terms in the deck, allowing you to delete certain terms
if desired. You can also view how many terms there are total, and you can customize how many new cards you would like to study today. This number is cumulative for the
whole day, so if you had already studied some cards earlier in the same day, you won't be given additional new cards on top of those ones. When you click Study Now, you
will be navigated away to a new screen where you can begin studying cards.

## Studying Decks

<img src="https://i.ibb.co/5rP74v9/IMG-5226.jpg" align="left" width=25%>
<img src="https://i.ibb.co/19xJ24k/IMG-5225.jpg" align="right" width=25%> 

### Studying

Studying cards is very intuitive; you are given the term, and when you press Show Answer and see the definition, you have to rate how well you knew the specific card.
Each day, you will be given a new number of cards based on the number you specified, plus you will have cards that are due for review. The cards you need to study are 
kept the same throughout the whole day, and the progress bar at the bottom of the screen shows you how much progress you have made. Sometimes studying a card does not 
contribute toward progress though; if you find a term to be really difficult, then that term will reappear later in the day, and it isn't until you become much more 
comfortable with that term that it goes away for the day and counts toward your progress.

### SRS Logic

Much of the logic for the Spaced Repition System design for this app was inspired by Anki's system, yet it was implemented very differently. The main addition
to this system is the "Way Too Easy" button, which if clicked, won't show the card for another year. The main purpose for this is to allow for users to passively clear
cards out of the deck if they already know those cards really well.

## Tech Stack

Tools used for this app were React Native to build the whole app and SQLite to build the database. AsyncStorage was also used, but this was only for simple
key-value pairs, namely the previous number of new cards that the user had set when studying a certain deck and the notepad on the home page. While the SQLite
database is vital for the program to work, the AsyncStorage has no direct contribution on the program's studying functionality.



To run, make sure to install all necessary dependencies, and run __npm start__ in the terminal.
