## Installation:
1. download node.js from nodejs.org

2. Install dependencies

```
npm ci 
```

3. create a new account on turntable.fm, this will be your bot. login as the bot and get it's user id and auth and enter that into the script in the setup section.
    make sure that you do this in the room that you want the bot to show up in as every room has a different room id. In order to find this information out download
   the bookmark that has a link provided for it below.

4. open up the script and enter in the data it asks for in the setup section at the top of the script (read the instructions carefully)

5. open up command prompt and change directory to the directory that your script is in.

6. finally in order to run the bot after you have changed directory appropriately type (node roboto.js) without the parenthesis into command prompt and hit enter. if it does not immediately give
   you some kind of a runtime error it is working. login to your main turntable account and go to the room that you are running the bot in and see if it is there.

7. If everything has gone well, make your bot a moderator in the room so that it can effectively enforce it's commands.

  *A last note, the auto djing in this script is meant for a 5 seater room, if you have less than five seats i highly recommend you turn this feature off when you start the bot up with the /getonstage command
   If you cannot get this bot to run for some reason feel free to open an issue on github.

--------------------------------------------------------------------------------------
In order to find the userid, auth and roomid of your bot use this bookmark by alain gilbert.

http://alaingilbert.github.com/Turntable-API/bookmarklet.html
--------------------------------------------------------------------------------------

## Additional Features:

This is an explaination of some of the additional features that the bot has.
*note: anywhere you need to enter a userid manually into the script you can user the /userid @name command to 
find out what their userid is, it works for anyone on turntable whether their offline or not.*



Stuck song detection - This feature is to combat the bug that turntable has still not addressed as of 01/28/2013 where
sometimes after a song is over it will not move onto the next song. When this happens the only way to address this problem
is for the person who's song is stuck to skip their song, otherwise it will stay stuck for hours. This is especially a problem
if your bot is the one who's song is stuck, since passer byers have no way of getting it off the decks (other than /skip).
It works by setting a timer at the beggining of each song that is 10 seconds longer than the length of your song, this is more than
enough time as usually songs transition in a matter of milliseconds. If it still has not moved onto the next dj by then, it gives
the stuck dj 20 seconds to skip their song, if they skip they are not removed from the decks, if they do not skip they are removed
from the decks.



Song length Limit - This works by getting the length of your song from turntable at the beggining of the song and then comparing
it to the number that you entered in the chillybot.js file. If after being converted to minutes the length of your song is longer
than the length in minutes that you entered into the script it gives 20 seconds to skip your song, if you manage to skip within
20 seconds you can stay on stage, if not you are removed.



dj afk limit - afk means away from keyboard, it is basically a catch all term on the internet to mean that you are not actively
participating in whatever activity it is your afk in. As far as this bot is concerned afk means that you are not hitting the 
awesome or lame button, you are not snagging a song, and you are not chatting. it gives a warning 5 minutes before whatever value
you set it to timeout at and one minute before it times out. after that it removes you from stage if you are still afk.
It does not remove the currently playing dj even if they are on timeout so that their song is allowed
to finish, however immediately afterwards they are removed.



audience afk limit - this works the same way as the dj afk limit, except it only affects the audience. It gives a warning one minute
before the timeout and then it boots you from the room.


event messages - this is an array of messages that you can type into the setup area. they will be displayed in the minute intervals that you specified in the setup,
one message will be displayed at a time, and then the counter is incremented and on the next time interval the next chronological message is displayed. if the counter
reached the end of the messages array it resets so the messages keep looping through until you turn the feature off. theres also the option of sending these messages through the pm.



vote skipping - This is voting to skip a song, type /skip in the chatbox in order to vote to skip the currently playing song.
If the vote passes then the currently playing dj is removed from stage by the bot. If the currently playing dj is on the masterIds
list then they are exempt from this.



song play limit - It keeps a record of the amount of songs that each dj has played. It increments
their song count at the end of their song, after which it compares the persons song count to
the value you have set in the chillybot.js file, if it is larger they are removed from stage.
*note the play limit acts differently depending on what its set to, if it is set to 1 it waits until
*it loops around to the left side so that people on left are not constantly skipped if the play limit is turned on
*while in the middle of the rotation. otherwise it checks each individual at the end of each song to see if they are
*over the play limit



spam limit - This is triggered anytime someone is automatically kicked off stage, such as when
they are banned from stage or when they keep trying to take a spot even though they are not first in line.
The default value is set to 3 times, that they can be kicked from stage in a time span of 10 seconds.
If they exceed this limit they are booted from the room, otherwise after the timeout is over
their spam counter is set back to 0.



queue timeout - This refers to the amount of time someone has to get on stage, when a spot opens
up on deck and someone is in the queue the bot tells them they have x amount of time to get on stage
(this amount of time is set by you in the script), after the timeout is up they are automatically
removed from the queue so that the next person can get on stage. Also if they get on stage
and someone else was behind them and theres another spot open on stage, the timeout is cleared
and it tells the next person in the queue to get on stage. Also you do not need to add yourself to the 
queue to get on stage when spots are open and no one has added themselves to the queue,
you will not be auto kicked.



queue - This is a list that people can add themselves to in order to get on stage in
an orderly deterministic manner. If people are in the queue, the first person in the queue
is given a set period of time to get on stage, during this time anyone else who tries to join
the stage is automatically removed. This is a good way to combat script users and gaurntees
that you will be able to get on stage.



vip list - This is a list that you can add yourself to, however it must remain empty when not in use,
it can be found in the chillybot.js file. When someones userid is in the vip list, the bot
automatically clears everyone currently on the stage who does not have their userid in this
list. everyone who tries to join the stage and does not have their userid in the list is
automatically removed from stage as well.



anti room advertising - if someone who is not a moderator puts a link in your chatbox to another room
they are automatically booted from the room. It does not kick for linking to the room its being used in.



ttstat kick - anyone named @ttstats is kicked when they try to join the room if this
feature is enabled. It does not kick ttstat bots that are already in your room.



ban list vs manual ban list - This goes for the stage banning list as well. The banning
that you can do through commands does actually ban the user from the room, however their
userid is stored in ram when that happens as there is no database. Also the command to check
the ban list and the stage ban list only reads names from the users that are banned through bot commands.
for perma banning you need to manually add their userid into the script in the setup section,
this is a different array from the one you can view during runtime.



autodjing - the bot gets on stage to play songs, by default when there are 3 or less people
on stage, and gets off stage when there are five people on stage including itself. These values
can be changed in the setup section of the script. It also gets on stage when there is no
song playing. If the /getonstage command is used it does not attempt to get on stage or get
off stage if it is already on stage. Autodjing does not work when the vip list is active
or when theyre are people waiting in the queue.



when moderators are removed or added - it is able to automatically tell when moderators 
are removed or added and distribute command access appropriately.



when the queue is on and 5 djs are on stage - it sends a pm to you telling you
the queue is active and how to add and remove yourself from it(when you join the room and this is true).



two levels of /pmcommands - there is a version that moderators see and a version
that regular users see, this is all the command that can be used in the pm.



master ids list - this is a list that you can add yourself to that exempts you
from being affected by voteskipping, the song length limit, the song play limit, or 
the dj afk limit. all others are affected, including moderators, when those limits
are active.


refresh command - some special things to note about this command is that it saves the persons play limit when they leave the room.
this is to prevent exploiting this command to reset your play limit. the most important thing to know about this is that it saves you "a" seat
on stage, not the same exact seat that you had. this means that if there is a queue and one person uses the refresh command and there are bunch
of empty seats open, it allows those seats to be filled, leaving only exactly enough space for the refresher or (refreshers) to get back on stage.



when people leave the room - most values and objects that people are occupying are freed
in memory when people leave the room, the queue is the exception to this, when people join
the queue they are not removed even if they leave the room, this is due to the nature of turntable
and the fact that sometimes you have to restart your browser. They will automatically be dealt
with in time by the queue timeout mechanism.

## Known issues:

/move command can have unexpected behavior depending on name formatting. best to only attempt it on no space names for now.
