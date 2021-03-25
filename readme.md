*Bot for Turntable.fm.*

The intention for this fork is to modularise the code to make it easier to configure and be more maintainable

Forked from Mr. Roboto https://github.com/jakewillsmith/roboto

Forked from chillybot: https://github.com/samuri51/chillybot


## Command List
### Admin Only Commands: (mod only)

/stage<space><@name> --> removes the person specified from the stage.

/ban<space><@name> --> kicks the person specified and prevents them from reentering the room (temp ban).

/unban<space><@name> --> takes the person specified off the ban list. they can now reenter the room.

/autodj --> this puts your bot on stage.

/eventmessageOn --> turns event messages on, if you have any messages in your event messages array the bot will say them at the time interval you specified

/eventmessageOff --> toggles event messages off

/removedj --> this removes your bot from the stage.

/randomSong --> this moves all the songs on your bots playlist into a random order. (one song switched per second, see console)

/bumptop<space><@name> --> this moves the name specified to the top of the queue list.

/afkon --> this turns on the afk timer and list. the default timer is 20 minutes.

/afkoff --> this turns off the afk timer.

/skipsong --> this skips your bots song if they are currently playing one.

/greeton --> turns the bots greeting message that it gives to users that join the room off and on.

/greetoff --> turns the room greeting off.

/messageOn --> the bot says the room info in chat every 15 minutes.

/messageOff --> toggles off the bots message.

/lame --> the bot lames the currently playing song.

/skipOn --> toggles the bots skipping features, which tells it to skip its song every it gets to them.

/skipOff --> toggles off the bots skip feature, they will now play their playlist.

/snagevery --> toggles on and off the bots ability to add every song that plays (turns off /autosnag when turned on)

/autosnag --> toggles on and off the bots ability to add every song that gets over a certain threshold of up votes (turns off /snagevery when turned on)

/snag --> the bot adds the currently playing song to its queue

/removesong --> the bot removes the song it is currently playing or the last song added to it's queue if it is not currently playing.

/voteskipon<space><number> --> set the vote skip limit and turn it on.

/voteskipoff --> turn the vote skip limit off.

/getonstage --> the first time you type it, it turns autodjing off, the second time you type it, it turns it back on again.

/banstage<space><@name> --> bans a user from playing songs on stage but does not kick them from the room

/unbanstage<space><@name> --> removes the user specified from the stage banning list

/userid<space><@name> --> get the userid of the person whos name you enter

/dive --> removes you from stage

/inform --> tells currently playing dj their song is not appropriate for the room

/whobanned --> gives the status of the banned from the room list, gives the persons userid then their name (only gives the status of names added during runtime, does not report on ids manually added to the script)

/whostagebanned --> gives the status of the banned from djing list, gives the persons userid then their name (only gives the status of names added during runtime, does not report on ids manually added to the script)

/username<space><userid> --> use a persons userid to get their name(works in the pm too, only works if user is in the room)

/songstatson --> turns song stats on for after a song ends

/songstatsoff --> turns song stats off

/modpm --> type this to enter the modpm group chat, only other people in the group chat can see your pm's,
	   type it again to leave the modpm group chat. you may still use commands while in the group chat, it only
           takes it as a modpm if no other commands match. while in the group chat just type 	   normally into the bot pm box and
           other people will see your message

/whosinmodpm --> returns a list of all the admins that are currently in the modpm group chat (pm only / admin only)


/setTheme<space><your message here> --> sets theme theme to be checked by /theme, also tells to the theme to people who join the room

/noTheme --> turns the theme off, stops telling theme to new people who join the room

/stalk<space><@name> --> use a persons userid to get a link to the room their in(works in the pm too, only works if user is in the room)

/lengthLimit --> toggles the song length limit on and off

/playLimitOn --> if no additional arguements given it sets the play limit to the default value in the setup

/playLimitOn<space><number> --> sets the play limit to whatever number you specifiy, i.e. /playLimitOn 3 sets it to 3

/playLimitOff --> turns play limit off

/whatsplaylimit --> tells you what the play limit is currently set to, if it is turned on.

/botstatus --> tells you which features are turned off and which are turned on (only the ones that you can toggle)

/playminus<space><@name> --> decrements a person's play count by one (to give them more songs to dj with when the play limit is turned on)

/refreshon --> enables the use of the /refresh command

/refreshoff --> disables the use of the /refresh command (handy if its being abused)



### Public Commands:

/commands --> shows a list of the bots public commands.

/queuecommands --> shows a list of the bots queueing commands.

/admincommands --> pm's the user the commands if they are an admin.

/dance - https://media.tenor.com/images/939895eeadd796565d3ef07b7a7169f3/tenor.gif

/frankie - Relax!

/hair - Jersey Hair: Engage

/eddie -  PARTY ALL THE TIME!

/lonely - Dancing with myself...

/jump - For my love!

/flirt - How YOU doin’?!

/rub - It rubs the lotion on its skin or else it gets the hose again

/wc - Everybody Wang Chung tonight.  Everybody have fun tonight.

/alice - We’re not worthy! We’re not worthy

/feart - It STINKS in here!

/afk --> this will mark you as afk the first time you type it, and unmark you as afk the second time

/djafk --> tells you the afk time of the dj's in minutes

/whosafk --> the bot says the names of everyone whos currently using the /afk command

/awesome --> the bot awesomes the currently playing song if they are not already.

/playlist --> bot says the total amount of songs in its playlist.

/cheers --> user raises their glass for a toast

/uptime --> get the amount of time the bot has been running for.

/mytime --> tells you how long you've been in the room for.

/djplays --> get the current song count for each dj.

/dance --> dancing

/theme --> tells you what the theme is if there is one.

/whosrefreshing --> the bot gives you a list of all the people who are on the refresh list

/refresh --> holds a persons seat on stage for x number of seconds which are set in the setup (no limit to how many times can be used)

/coinflip --> bot flips a coin

/mom --> tells the person something about their mom...

/beer --> gives the user that uses the command a beer.

/escortme --> the user that uses this command will be escorted off the stage after their next play.

/stopescortme --> the user that uses this command will be removed from the escort list.

/roominfo --> the bot says the rooms description in chat.

/fanme --> the bot fans the user.

/unfanme --> the bot unfans the user if it was already their fan.

/getTags --> tells the user the details of the last played song.

/dice --> returns a random integer between 1 and 6.

/m<space><your message here> --> the bot says literally what you type. (mod only)

/hello --> greets the user.

/props --> gives the currently playing dj a high five.

/skip --> votes for the currently playing dj to be removed from stage.

/dive --> removes you from stage if your on stage.

/up? --> This only works if your on stage, it asks the audience if anyone wants to dj, chatbox only

/warnme --> warns dj's on stage when their song is to be played next


### Queue Commands: (public/mod)

/queue --> the bot says the queue list in chat if there is one.

/position --> the bot tells you your position in the queue

/removefromqueue<space><@name> --> removes the person from the queue if they are currently in it.(moderator only)

/removeme --> removes the user from the queue list.

/addme --> adds the user to the queue list.

/queueOn --> turns the queue on. Also clears any existing queue. (moderator only)

/queueOff --> turns the queue off. (moderator only)

/move<space><name><space><number> --> this moves the person specified in the queue to the position
				      specified. example: /move bob 3
				      when used in the chatbox you must use an @ symbol also
                                      example: /move @bob 3

/queuewithnumbers --> returns a list of the people in the queue with a number signifying their position next to their name, this is useful with /move


### PM Commands: (public/mod)

/pmcommands --> tells the sender all of the commands that they can use in the pm, there is a separate list for moderators and non- moderators. all commands have the same behavior as those listed above.

/stage<space><@name> --> the command that only works in the pm, it allows moderators to remove any dj from stage using their name anonymously through the bot.

/boot<space><name> --> boots a person from the room, only works if the name is one word long

/boot<space><name><space><message> --> another version of the same command, it automatically knows you are using subsequent versions of it simply by the parameters passed in.
					the number you must pass in is the number of words that their name conists of.
				       only works when the name is one word long, example: /boot bob booting you from the room

/boot<space><number><space><name> --> this is the version of the boot command that you must use when a person's name consists of more than one word
				      the number you must pass in is the number of words that their name conists of.
			              example: /boot billy

/boot<space><number><space><name><space><message> --> this is the version you use when person's name is longer than one and you want a boot message.
							example: /boot 3 billy get out of my room

/whosinmodpm --> returns a list of all the admins that are currently in the modpm group chat (pm only / admin only)
