Bugs
* sending !addme in PM incorrectly adds the Bot to the queue rather than the user
* sending !sarahConner in PM reports that the Bot sent the command, not the user
* check commands for correct number of arguments
  * return help description with example command rather than the Bot crashing
* ~~queue disabled, kicking people because holding a spot for the refresh list~~
  * ~~inconsistent and unrepeatable, needs more info~~
* ~~after adding a user to the queue and joining, the bot eventually sends a message "Sorry @undefined you have run out of time."~~

Worklist (in order)
* add djIdle on/off commands
* add getOnStage command
* add botStatus command
* add /m (rename to say??) command

Feature Requests
* create rommSummary command
  * useful for mods just entering the room to know what's what
* make comamnds case insensitive
* if a DJ leaves the room, and hasn't used the refresh command they should be removed from the queue
* restart command to not disrupt the room when changes are made
  * have the bot save the user/queue states as JSON(?) and reload them
* parse "region": [] from current_song data to tell people if their songs are unavailable in certain countries?
  * configurable list of countries
  * by users?
* Switching playlists on should not reset playcounters
  * unless you want it to?
* remove someone from the queue if they leave the room and don’t use /refresh
* Msg DJs when they’re going to be taken down while playlist is on, before their track
  * give people the chance to pick their last track properly
* room boot when advertising other rooms
** sometimes boots when sending other link types
* Can the bot check and report when vids are region restricted?
* /roomstatus - report on the room, dj plays, time, afk etc. Useful for when Mods come into the room and what to know the state of things
* don't respond to users about a user being AFK, unless they're using their full username with @ on the front
* don't reset the djplay counters when enabling the playlimit, or at least have a separate counter so that the djstats can be maintained
* roomsummary command available to all room users giving info on queue, playlimits etc
* admin function to manually set DJ playcounts, if the bot crashes for example
* post Minday "OK, I Love You Bye Bye" gif when booting etc
https://media.giphy.com/media/l2QE4oXcsxunFIUo0/giphy.gif
* personalised /props gifs and welcome messages tied to userIDs
* automatic messages on passing certain scores??
