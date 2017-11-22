// LIRI is a Language Interpretation and Recognition Interface.

// Information is retrieved and displayed from the following Web APIs using node.js:
//	1. Open Movie Database
//	2. Spotify
//	3. Twitter

// The retrieved information is displayed in the bash/terminal window and written to the file log.txt. 
// NOTE: Open the log.txt file in the Sublime Text editor. For some reason it doesn't display correctly in Windows Notepad.

// Command line arguments are not case-sensetive.

// At the bash/terminal window enter 'node liri.js', the action argument and an optional song/movie name.
// 
// These command lines are allowed in the bash/terminal window:
// -----------------------------------------------------------
// node liri.js my-tweets

// node liri.js spotify-this-song <optional song name>
// 	*NOTE: When a song name isn't entered, information for the song 'The Sign' by 'Ace of Base' will be displayed

// node liri.js movie-this <optional movie name>
//	*NOTE: When a movie name isn't entered, information for the movie 'Mr. Nobody' will be displayed

// node liri.js do-what-it-says. This will read the text file random.txt to retrieve the action argument and song/movie name. 


var argAction = process.argv[2];			// Action argument entered on the command line
var argTitle = process.argv[3];				// The first word of a song/movie name argument entered on the command line
var originalArgTitle = '';						// The original song/movie name argument entered on the command line
var validArguments; 									// Boolean used in validating command line arguments
var twitterUserName = 'jamesalias99';

var displayResults = '';							// Displays the results to the bash/terminal window and is written to the log.txt file

// File System for node.js
var fsLog = require('fs');

// Validate the action element from the command line
validArguments = validateArguments();

if (validArguments) {
	determineAction();
}

// Validate the action argument
function validateArguments() {

	var argActionLC = "";

	// Was the required action argument entered?
	if (argAction === undefined) {
		console.log('\n************************ OOPS! ************************'); 
		console.log('You forgot to enter a required argument.');
		console.log('No harm, try again!')
		console.log('\nEnter one of the following:');
		console.log('--------------------------');
		console.log('my-tweets');
		console.log('spotify-this-song');
		console.log('movie-this');
		console.log('do-what-it-says');
		return false;
	}
	else {
		argActionLC = argAction.toLowerCase();
	}

	// Is the action argument valid?
	if (argActionLC !== 'my-tweets' &&
			argActionLC !== 'spotify-this-song' &&
			argActionLC !== 'movie-this' &&
			argActionLC !== 'do-what-it-says') {
		console.log('\n************************ OOPS! ************************'); 
		console.log("The argument you entered isn't valid. You entered " + argAction);
		console.log('No harm, try again!')
		console.log('\nEnter one of the following:');
		console.log('--------------------------');
		console.log('my-tweets');
		console.log('spotify-this-song');
		console.log('movie-this');
		console.log('do-what-it-says');
		return false;
	}

	// Concatenate the song/movie name argument because it might contain spaces
	if (argTitle !== undefined) {
		for (var i = 4; i < process.argv.length; i++) {
		  argTitle += ' ' + process.argv[i];
		}
		originalArgTitle = argTitle.trim();
		argTitle = originalArgTitle.toLowerCase();
	}

	argAction = argActionLC;

	return true;
}

// See which function to execute based on the action argument
function determineAction() {

	switch(argAction) {
		case 'my-tweets':
			getTweet();
			break;
		case 'spotify-this-song':
			getSpotify()
			break;
		case 'movie-this':
			getMovie();
			break;
		case 'do-what-it-says':
			getRandom();
	}
}

// Retrieve the last 20 tweets for user jamesalias99
function getTweet() {

	// Twitter node.js package
	var Twitter = require('twitter');

	// Twitter Credentials
	var myTwitterKeys = require('./keys.js');

	var client = new Twitter(myTwitterKeys);

	// Search up to 20 of the latest tweets for jamesalias99
	client.get('statuses/user_timeline', {screen_name: twitterUserName, count: 20}, function(error, tweet, response) {
	  if(error) { 
	  	console.log('\n---getTweet() Error =', error);
	  	return;
	  }
	  else {
	  	displayTweets(tweet, response);
	  }
	});
}

// Display the last 20 tweets for user jamesalias99
function displayTweets(tweet, response) {

	var i = 0;
	var tweetMessageCount = 0;
	var tweetTime = '';
	var tweetMessage = '';

	displayResults += '\nEnjoy reading the latest 20 or so tweets written by ' + twitterUserName + '!';
	displayResults += '\n----------------------------------------------------------------';

	tweetMessageCount = response._eventsCount;

	// Display the tweets
	for (i = 0; i < tweetMessageCount; i++) {
	  tweetTime = tweet[i].created_at;
	  tweetMessage = tweet[i].text;

	  displayResults += '\n\n' + Number.parseInt(i+1) + '. On ' + tweetTime + ' '
	  							 + twitterUserName + ' wrote:\n\t"' + tweetMessage + '"';
	}

	console.log(displayResults);

	writeLog();
}

// Retrieve a songs information from Spotify
function getSpotify() {

	var artistName = '';
	var songName = '';

	// Was the song name entered on the command line or in the random.txt file?
	// If not, use a default song name and artist name.
	if (argTitle === undefined || argTitle === '') {
		songName = 'The Sign';
		artistName = 'Ace of Base';
	}
	else {
		songName = argTitle;
	}

	songName = songName.toLowerCase();
	songName = songName.replace(/"/g, ' ');
	songName = songName.trim();

	artistName = artistName.toLowerCase();

	// Spotify node.js package
	var Spotify = require('node-spotify-api');

	// Spotify Credentials
	var spotify = new Spotify({
  	id: '4d7dbf8962e844dd93aa2acfc99314e2',
  	secret: '47230c253811409d82afb263202fc86a'
	});

	// Search for the track name and artist name.
	// The artist name defaults if the song name isn't entered on the command line.
	spotify.search({type: 'track', query: songName, artist: artistName}, function(err, data) {
  	if (err) {
  		console.log('\n---getSpotify() Error =', err);
  		return;
  	}
  	else {
  		displaySpotify(data, songName, artistName);
  	}
  });
}

// Display the song information from Spotify
function displaySpotify(data, songName, artistName) {

	var i = 0;
	var isFound = false;
	var spotifyArtistName = '';
	var spotifySongName = '';
	var spotifyPreviewURL = '';
	var spotifyAlbumName = '';

  // Search for the exact song name (and artist name if the song name isn't entered on the command line)
  for (i = 0; i < data.tracks.items.length; i++) {
  	
  	// Change the Spotify song name and Spotify artist name to lowercase for matching purposes
  	spotifySongName = data.tracks.items[i].name.toLowerCase();
	  spotifyArtistName = data.tracks.items[i].artists[0].name.toLowerCase();
	  
	  // Was the song name found?
  	if (songName !== spotifySongName) {
  		continue;		// No, continue with the next iteration of the for loop
  	}

  	// Does the artist name match?
  	if (artistName === '' || artistName === spotifyArtistName) {
	  	spotifySongName = data.tracks.items[i].name;
		  spotifyArtistName = data.tracks.items[i].artists[0].name;
	  	spotifyAlbumName = data.tracks.items[i].album.name;
		  spotifyPreviewURL = data.tracks.items[i].preview_url;
  		isFound = true;
  		break;	// Exit out of the for loop
  	}
  }

  // Was an exact match found?
  if (isFound) {
  	if (argTitle === undefined || argTitle === '') {
    	displayResults += '\nSince you\'re to LAZY to tell me a song name, I chose the song "' + spotifySongName + '" for you!';
  	}
  	else {
	   	displayResults += '\nHere is the information for the song "' + spotifySongName + '" that you requested!';
  	}
   	displayResults += '\n\n\tArtist Name:  ' + spotifyArtistName;
   	displayResults += '\n\tSong Name:  ' + spotifySongName;
	
	  // Sometimes a song doesn't have a preview URL
   	if (spotifyPreviewURL !== null) {
   		displayResults += '\n\tSong Preview Link:  ' + spotifyPreviewURL;
   	}
   	else {
   		displayResults += '\n\tSong Preview Link:  Unavailable';
   	}
   	displayResults += '\n\tAlbum:  ' + spotifyAlbumName;
  }
  else {
  	displayResults += '\nSorry but I couldn\'t find any information for the song "' + originalArgTitle + '".';
  }

  console.log(displayResults);

  writeLog();
}

// Retrieve a movies information from the Open Movie Database
function getMovie() {

	var movieName = '';
	var movieJson = '';

	// Was the movie name entered on the command line or in the random.txt file?
	// If not, use a default movie name.
	if (argTitle === undefined || argTitle === '') {
		movieName = 'Mr. Nobody';
	}
	else {
		movieName = argTitle;
	}

	// require node.js package
	var request = require('request');

	request('http://www.omdbapi.com/?t=' + movieName + ' &type=movie&plot=short&apikey=trilogy', function(error, response, body) {

	//Was the request successful?
  if (!error && response.statusCode === 200) {
    movieJson = JSON.parse(body);
	  //Was the movie name found in the request?
	  if (movieJson.Title === undefined) {
	  	displayResults += '\nWhoever told you that "' + originalArgTitle + '" was a movie, they were wrong!';
	  	console.log(displayResults);
	  	writeLog();
	  }
	  else {
	  	displayMovie(movieJson, movieName);
  	}
  }
  else {
  	console.log('\n---getMovie() Error =', error);
  }
	});
}

// Display the movie information from the Open Movie Database
function displayMovie(movieJson, movieName) {

  //Was the movie name entered on the command line or in the random.txt file?
  if (argTitle === undefined || argTitle === '') {
  	displayResults += '\nSince you\'re to LAZY to tell me a movie name, I chose the movie "' + movieName + '" for you!';
  }
  else {
  	displayResults += '\nHere is the information for the movie "' + movieJson.Title + '" that you requested!';
  }
  
  displayResults += '\n\n\tMovie Title:  ' + movieJson.Title;
  displayResults += '\n\tYear The Movie Was Released:  ' + movieJson.Year;
  displayResults += '\n\tInternet Movie Database Rating:  ' + movieJson.Ratings[0].Value;

  // Sometimes a movie doesn't have a Rotten Tomatoes rating
	if (movieJson.Ratings.length === 1) {
  	displayResults += '\n\tRotten Tomatoes Rating:  Unavailable';
  }
  else {
    displayResults += '\n\tRotten Tomatoes Rating:  ' + movieJson.Ratings[1].Value;
  }

  displayResults += '\n\tProduced In The Country(s) Of:  ' + movieJson.Country;
  displayResults += '\n\tLanguage(s) Available:  ' + movieJson.Language;
  displayResults += '\n\tMovie Plot:  ' + movieJson.Plot;
  displayResults += '\n\tActors:  ' + movieJson.Actors;

  console.log(displayResults);

  writeLog();
}

// Read the random.txt file to determine what action to take and song/movie to retrieve
function getRandom() {

	// File System for node.js
	var fsRandom = require('fs');

	// Read the file "random.txt"
	fsRandom.readFile('random.txt', 'utf8', function(error, data) {

  // Check for errors reading the file
  if (error) {
    console.log('\n---getRandom() Error =', error);
    return;
  }

  //Split the returned data by commas so it can be used
  var dataArr = data.split(',');

  argAction = dataArr[0];
  argTitle = dataArr[1];

 	if (argTitle !== undefined) {
		argTitle = argTitle.replace(/"/g, ' ');
		argTitle = argTitle.trim();
	}

  // Validate the action argument from the random.txt file
  validArguments = validateArguments();

	if (validArguments) {
		determineAction();
	}
	});
}

// Append the results to the log.txt file.
// This is the same information displayed in the bash/terminal window.
function writeLog() {

	var i = 0;
	var commandLine = '';
	var commandLineEntered = '';
	var liriPosition = 0;
	var logResults = '';
	var textFile = 'log.txt';

	// Concatenate the command line arguments
	for (i = 0; i < process.argv.length; i++) {
		commandLine += process.argv[i] + ' ';
	}

	// Find the position of liri.js in the command line
	var liriPosition = commandLine.search('liri.js');
	
	// Extract the string from the command line beginning with liri.js to the end of the command line
	var commandLineEntered = commandLine.substring(liriPosition);

	// Prepend the command line arguments to displayResults
	var logResults = '*** node ' + commandLineEntered + '\n' + displayResults + '\n\n\n';

	// Append the log results to the file log.txt.
	// If log.txt doesn't exist it will be created.
	fsLog.appendFile(textFile, logResults, function(err) {
	  if (err) {
	    console.log('\n---writeLog() Error =', err);
	  }
	})
}