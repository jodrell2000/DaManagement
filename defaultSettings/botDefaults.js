module.exports = {
    howManyVotes: 10, //how many awesome's for a song to be automatically added to the bot's playlist(only works when autoSnag = true;)
    howLongStage: 60, /*how many second's does a dj have to get on stage when it's their turn to dj after waiting in the queue.
						 The value must be entered in seconds in order to display the correct message, i.e 3 mins = 180 seconds.
						 Note that people are not removed from the queue when they leave the room so a lower number is preferable in high pop rooms to avoid backup.
						 (only work when queue = true)
						*/

    //this is for the bot's autodjing(triggers on new song, bot also gets on when no song is playing, unless autodjing is turned off)
    getonstage: false, //autodjing(on by default)
    whenToGetOnStage: 1, //when this many or less people djing the bot will get on stage(only if autodjing is enabled)
    whenToGetOffStage: 3, //when this many people are on stage and auto djing is enabled the bot will get off stage(note: the bot counts as one person)

    autoSnag: true, //auto song adding(different from every song adding), tied to  botDefaultsModule.howManyVotes up above, (off by default)
    autoBop: true, //choose whether the bot will autobop for each song or not(against the rules but i leave it up to you) (off by default)

}
