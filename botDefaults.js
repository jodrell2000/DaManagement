exports.defaults = defaults;

var playLimit = 4; //set the playlimit here (default 4 songs)
var songLengthLimit = 10.0; //set song limit in minutes
var afkLimit = 20; //set the afk limit in minutes here
var howOftenToRepeatMessage = 15; //how often (in minutes) to repeat the room message (this corresponds to the MESSAGE variable below, only works when MESSAGE = true;)
var roomafkLimit = 10; //set the afk limit for the audience here(in minutes), this feature is off by default
var howManyVotes = 10; //how many awesome's for a song to be automatically added to the bot's playlist(only works when autoSnag = true;)
var howLongStage = 60;
/*how many second's does a dj have to get on stage when it's their turn to dj after waiting in the queue.
						 The value must be entered in seconds in order to display the correct message, i.e 3 mins = 180 seconds.
						 Note that people are not removed from the queue when they leave the room so a lower number is preferable in high pop rooms to avoid backup.
						 (only work when queue = true)
						*/
