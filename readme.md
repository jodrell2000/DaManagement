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

### linting and code formating
* use eslint to find code problems:
  ```
  npm run lint
  ```

* use prettier to check code:
  ```
  npm run tidy
  ```
  
* use prettier to tidy code:
  ```
  npm run tidy:fix
  ```
  
### DaManagement
* prerequisite installs
  ```
  npm install -g npm-check-updates
  ncu -u
  npm ci 
  ```
  
* next copy the file .env.example to .env and set your Bot's USERID, AUTH, ROOMID and the character you'd like to use to identify commands sent to it
  
* start it directly using:
  ```
  node DaManagement.js
  ```
* or start it with the bash script to restart it following any crashes after 30 seconds of innactivity
  * this does mean that if the bot is shutdown using the sarahConner command it will be restarted...probably means you shouldn't use this command if you suspect your bot has disruptive bugs ;-)
  * 
  ```
  ./startManagement.sh
  ```
* uses the modules in the folder *modules*
* static configuration settings are contained in files within the *defaultSettings* folder
* modules containing functions and variables that are mofifyiable using commands are contained in the *modules* folder

The current command list for DaManagement.js exists in the file modules/commandModule.js

The comamnds follow the pattern,

commands.[command name] = (data, command) => {  }  
commands.[command name].argumentCount = 1;  
commands.[command name].help = "'/[command name]' Info for how to use an individual command";
commands.[command name].sampleArguments = [ "blah" ];


I'm trying to put the commands into groups such as <strong>moderatorCommands</strong> (so that the verification that they're being called by a Mod can be centralised), or <strong>botCommands, playlistCommands</strong> so that the /list command can display available commands in logical groups.

Ideally the commands.[command name].help list from that file would be parsed here to act as a manual...oh well, maybe later :-)

### Testing
Thanks to an actual, genuine, honest to goodness developer @1hitsong the bot now has some king of testing framework that hopefully we can build on.

To  run the tests use the command
```
npm test
```
The tests are written using Jest, so you'll either need to know how that works, or read the existing tests and figure it out (like I'm currently doing). If you need some more help there's documentation here: https://jestjs.io

### Disclaimer ;-)

FYI: I'm a DBA, not a developer, as anyone who knows more about javascript than I do will easily tell from the code :-)
