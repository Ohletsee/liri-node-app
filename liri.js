// LIRI is a Language Interpretation and Recognition Interface.

// Information is retrieved and displayed from the following Web APIs using node.js:
//	1. Open Movie Database
//	2. Spotify
//	3. Twitter.

// The retrieved information is displayed in the bash/terminal window and written to a file called log.txt. 

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


var argAction = process.argv[2];	// Action argument from the command line
var argTitle = process.argv[3];		// The first word of a song/movie name argument from the command line
var originalArgTitle = "";				// The original song/movie name argument from the
var validArguments; 							// Boolean used in validating command line arguments
var displayResults = "";					// Displays the results to the bash/terminal window and is written to the log.txt file

// Validate the action element from the command line
validArguments = validateArguments();

if (validArguments) {
	determineAction();
}

// Validate the action argument
function validateArguments() {

	console.log('\n---validateArguments() Entered');

	var argActionLC = "";

	console.log('\n---validateArguments() argAction =', argAction);
	console.log('---validateArguments() argTitle =', argTitle);

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

	console.log('---ValidateArguments() argActionLC =', argActionLC);

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
		console.log('---validateArguments() argTitle =', argTitle);
		originalArgTitle = argTitle.trim();
		console.log('---validateArguments() originalArgTitle =', originalArgTitle);
		argTitle = originalArgTitle.toLowerCase();
		console.log('---validateArguments() argTitle.toLowerCase() =', argTitle);
	}

	argAction = argActionLC;

	return true;
}

// See which function to execute based on the action argument
function determineAction() {

	console.log('\n---determineAction() Entered');
	console.log('---determineAction() argAction =', argAction);

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

// Retrieve and display the last 20 tweets for user name jamesalias99
function getTweet() {

	console.log('\n---getTweet() Entered');

	var i = 0;
	var tweetMessageCount = 0;
	var tweetTime = '';
	var tweetMessage = '';
	var twitterUserName = 'jamesalias99';

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

	  console.log('\nEnjoy reading the latest 20 or so tweets written by ' + twitterUserName + '!');
	  console.log('----------------------------------------------------------------');

	  tweetMessageCount = response._eventsCount;

	  // Display the tweets
	  for (i = 0; i < tweetMessageCount; i++) {
		  tweetTime = tweet[i].created_at;
		  tweetMessage = tweet[i].text;

		  console.log('\n' + Number.parseInt(i+1) + '. On ' + tweetTime + ' ' + twitterUserName + ' wrote:\n\t"' + tweetMessage + '"');
		}
	});
}

// Retrieve and display a songs information from Spotify
function getSpotify() {

	console.log('\n---getSpotify() Entered');

	console.log('\n---getSpotify() argTitle =', argTitle);

	var i = 0;
	var isFound = false;
	var artistName = '';
	var artistNameDefault = '';
	var songName = '';
	var spotifyArtistName = '';
	var spotifySongName = '';
	var spotifyPreviewURL = '';
	var spotifyAlbumName = '';

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
	console.log('---getSpotify() songName.toLowerCase =', songName);

	artistName = artistName.toLowerCase();
	console.log('---getSpotify() artistName.toLowerCase =', artistName);

	// Spotify node.js package
	var Spotify = require('node-spotify-api');
	console.log('---getSpotify() Spotify =', Spotify);

	// Spotify Credentials
	var spotify = new Spotify({
  	id: '4d7dbf8962e844dd93aa2acfc99314e2',
  	secret: '47230c253811409d82afb263202fc86a'
	});

	console.log('---getSpotify() spotify =', spotify);

	// Search for the track name and artist name.
	// The artist name defaults if the song name isn't entered on the command line.
	spotify.search({type: 'track', query: songName, artist: artistName}, function(err, data) {
  	if (err) {
  		console.log('---getSpotify() Error =', err);
  		return;
  	}

  // Search for the exact song name (and artist name if the song name isn't entered on the command line)
  for (i = 0; i < data.tracks.items.length; i++) {
  	console.log('---getSpotify() i =', i);
  	
  	// Change the Spotify song name and Spotify artist name to lowercase for matching purposes

  	spotifySongName = data.tracks.items[i].name.toLowerCase();
	  console.log('---getSpotify() spotifySongName =', spotifySongName);
	  
	  spotifyArtistName = data.tracks.items[i].artists[0].name.toLowerCase();
	  console.log('---getSpotify() spotifyArtistName.toLowerCase() =', spotifyArtistName);
	  
	  // Was the song name found?
  	if (songName !== spotifySongName) {
  		continue;		// No, continue with the next iteration of the for loop
  	}

  	if (artistName === '' || artistName === spotifyArtistName) {
	  	spotifySongName = data.tracks.items[i].name;
		  console.log('---getSpotify() spotifySongName =', spotifySongName);
		  
		  spotifyArtistName = data.tracks.items[i].artists[0].name;
		  console.log('---getSpotify() spotifyArtistName =', spotifyArtistName);
			
	  	spotifyAlbumName = data.tracks.items[i].album.name;
		  console.log('---getSpotify() spotifyAlbumName =', spotifyAlbumName);
		  
		  spotifyPreviewURL = data.tracks.items[i].preview_url;
		  console.log('---getSpotify() spotifyPreviewURL =', spotifyPreviewURL);
  		isFound = true;
  		break;	// Exit out of the for loop
  	}
  }

  // Was an exact match found?
  if (isFound) {
  	if (argTitle === undefined || argTitle === '') {
    	console.log('\nSince you\'re to LAZY to tell me a song name, I chose the song "' + spotifySongName + '" for you!');
  	}
  	else {
	   	console.log('\nHere is the information for the song "' + spotifySongName + '" that you requested!');
  	}
   	console.log('\n\tArtist Name:  ', spotifyArtistName);
   	console.log('\tSong Name:  ', spotifySongName);
   	if (spotifyPreviewURL !== null) {
   		console.log('\tSong Preview Link:  ', spotifyPreviewURL);
   	}
   	else {
   		console.log('\tSong Preview Link:  Unavailable');
   	}
   	console.log('\tAlbum:  ', spotifyAlbumName);
  }
  else {
  	console.log('Sorry but I couldn\'t find any information for the song "' + originalArgTitle + '".');
  }
  });
}

// Retrieve and display a movies information from the Open Movie Database
function getMovie() {

	console.log('\n---getMovie() Entered');

	console.log('---getMovie() argTitle =', argTitle);

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

	console.log('---getMovie() movieName =', movieName);

	var request = require('request');

	request('http://www.omdbapi.com/?t=' + movieName + ' &type=movie&plot=short&apikey=trilogy', function(error, response, body) {

	//Was the request successful?
  if (!error && response.statusCode === 200) {

  	//Parse the body that was returned from the request
    movieJson = JSON.parse(body);
    console.log('\n---getMovie() movieJson =', movieJson);

    //Was the movie name found in the request?
    if (movieJson.Title === undefined) {
    	console.log('\nWhoever told you that "' + originalArgTitle + '" was a movie, they were wrong!');
    	return;
    }

    //Was the movie name entered on the command line or in the random.txt file?
    if (argTitle === undefined || argTitle === '') {
    	console.log('\nSince you\'re to LAZY to tell me a movie name, I chose the movie "' + movieName + '" for you!');
    }
    else {
    	console.log('\nHere is the information for the movie "' + movieJson.Title + '" that you requested!');
    }
    
    console.log('\n\tMovie Title:  ' + movieJson.Title);
    console.log('\tYear The Movie Was Released:  ' + movieJson.Year);
    console.log('\tInternet Movie Database Rating:  ', movieJson.Ratings[0].Value);
		
    //There are times when a movie is returned and the Rotten Tomatoes rating is not returned. See if it was returned. I would of preferred using the method hasOwnProperty() to check if the property was returned, but I couldn't figure out how to get it to work.
		if (movieJson.Ratings.length === 1) {
    	console.log('\tRotten Tomatoes Rating:  Unavailable');
    }
    else {
      console.log('\tRotten Tomatoes Rating:  ', movieJson.Ratings[1].Value);
    }

    console.log('\tProduced In The Country(s) Of:  ', movieJson.Country);
    console.log('\tLanguage(s) Available:  ', movieJson.Language);
    console.log('\tMovie Plot:  ', movieJson.Plot);
    console.log('\tActors:  ', movieJson.Actors);
  }
	});
}

// Read the random.txt file to determine what action to take
function getRandom() {

	console.log('\n---getRandom() Entered');

	console.log('\n---getRandom() argTitle =', argTitle);

	// File System for node.js
	var fs = require('fs');

	// Read the file "random.txt"
	fs.readFile('random.txt', 'utf8', function(error, data) {

  // Check for errors reading the file
  if (error) {
    console.log('\n---getRandom() Error =', error);
    return;
  }

  //Split the returned data by commas so it can be used
  var dataArr = data.split(',');

  // Display the contents of data
  console.log('\n---getRandom() error = ', error);
  console.log('\n---getRandom() data = ', data);

  // We will then re-display the content as an array for later use.
  console.log('\n---getRandom() dataArr = ', dataArr);
  console.log('\n---getRandom() dataArr.length = ', dataArr.length);

  argAction = dataArr[0];
  argTitle = dataArr[1];

 	// argTitle = argTitle.toLowerCase();
 	if (argTitle !== undefined) {
		argTitle = argTitle.replace(/"/g, ' ');
		argTitle = argTitle.trim();
	}


  console.log('\n---getRandom() argAction = ', argAction);
  console.log('\n---getRandom() argTitle = ', argTitle);

  // Validate the action argument from the random.txt file
  validArguments = validateArguments();

	if (validArguments) {
		determineAction();
	}
	});
}