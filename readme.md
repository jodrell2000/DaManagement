*Bot to manage queues, and give info for Turntable.fm.*

The intention for this fork is to modularise the code to make it easier to configure and be more maintainable

Forked from Mr. Roboto https://github.com/jakewillsmith/roboto

Forked from chillybot: https://github.com/samuri51/chillybot

### Introduction
My intention here was to make the bot easier to maintain and add/modify commands. I've tried to modularise the commands into their own functions, and to move parameters into relevant objects.

### What's here...
There are 2 bots in this repo. The actuall turntable.fm bot called <strong>DaManagement.js</strong> and a small bot called <strong>chatBot.js</strong> (that also connects to turntable.fm) that I've been using to test concepts, and learn a bit more about how to do things in javascript

### chatBot
* started with:
  ```
  node chatbot.js
  ```
* uses the modules in the folder *chatbot*
* uses the file *authChat.js* for its authentication details

### DaManagement
* started with:
  ```
  node DaManagement.js
  ```
* uses the modules in the folder *modules*
* uses the file *auth.js* for its authentication details
* static configuration settings are contained in files within the *defaultSettings* folder
* modules containing functions and variables that are mofifyiable using commands are contained in the *modules* folder

The current command list for DaManagement.js exists in the file modules/commandModule.js

The comamnds follow the pattern,
commands.[command name] = (data, command) => {  }  
commands.[command name].argumentCount = 1;  
commands.[command name].help = "'/[command name]' Info for how to use an individual command";

I'm trying to put the commands into groups such as <strong>moderatorCommands</strong> (so that the verification that they're being called by a Mod can be centralised), or <strong>botCommands, playlistCommands</strong> so that the /list command can display available commands in logical groups.

Ideally the commands.[command name].help list from that file would be parsed here to act as a manual...oh well, maybe later :-)

### Testing
Yeah, it'd be lovely to have some kind of mock turntable.fm that could be developed against, but until then I'm just having to run things against either an empty test room, or when I actuually need to see if things work with more than just me, using the fantastic people in https://turntable.fm/i_the_80s

My intention was to create some kind of unit tests, and that's what the <strong>*tests*</strong> folder was supposed to contain. Honestly I kinda got bored and wanted to just get things working. Yes, yes...I know that's probably the wrong way round, but we're also well beyond my javascript level here. Any help in this, and any other, area will be grafetully received

### Disclaimer ;-)

FYI: I'm a DBA, not a developer, as anyone whoknows more about javascript than I do will easily tell from the code :-)