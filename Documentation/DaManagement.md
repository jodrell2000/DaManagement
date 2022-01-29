## DaManagement
### Setup
* prerequisite installs
  ```
  npm install -g npm-check-updates
  ncu -u
  npm ci 
  ```

* next copy the file .env.example to .env and set your Bot's USERID, AUTH, ROOMID and the character you'd like to use to identify commands sent to it. Info on how to find the AUTH and ROOMID are contained in the .env.example file
* finally, take a look inside the data folder. It contains several (OK, 1 currently) data files written to and read by the bot. This allows changes to be made using commands, rather than directly editing files and having to restart the bot.
  * aliases.json contains alternative words that can be used to initiate commands. It's handy for fixing common typos eg. bows is an alias for bow because I can never remember which it is
  * If you want to use these aliases, or any other data files, simply create a file without `_example` in the name and copy the example contents into it

### Running the Bot
* start it directly using:
  ```
  node DaManagement.js
  ```
* or start it with the bash script to restart it following any crashes after 30 seconds of inactivity
    * this does mean that if the bot is shutdown using the sarahConner command it will be restarted...probably means you shouldn't use this command if you suspect your bot has disruptive bugs ;-)
  
  ```
  ./startManagement.sh
  ```
### Other info
* other than the main file, `DaManagement.js`, the main Bot uses the modules in the folder *modules*
* static configuration settings are contained in files within the *defaultSettings* folder
* dynamic configuration/settigns are contained in the data folder. This uses node-storage to read/write from the files and mean fewer restarts are required to make changes
* the current command list for DaManagement.js exists in the file `modules/commandModule.js`, although I'm hoping to build something to reparse that file into some kind of user guide

### adding commands
New commands should be added to the file `modules/commandModule.js`

The commands follow the pattern,

```
commands.[command name] = (data, command) => {  }  
commands.[command name].argumentCount = 1;  
commands.[command name].help = "'/[command name]' Info for how to use an individual command";
commands.[command name].sampleArguments = [ "blah" ];
```

I'm trying to put the commands into groups such as <strong>moderatorCommands</strong> (so that the verification that they're being called by a Mod can be centralised), or <strong>botCommands, playlistCommands</strong> so that the /list command can display available commands in logical groups.
