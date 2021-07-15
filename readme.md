*Bot to manage queues, and give info for Turntable.fm.*

The intention for this fork is to modularise the code to make it easier to configure and be more maintainable

Forked from Mr. Roboto https://github.com/jakewillsmith/roboto

Forked from chillybot: https://github.com/samuri51/chillybot

My intention here was to make the bot easier to maintain and add/modify commands. I've tried to modularise the commands into their own functions, and to move parameters into relevant objects.

The current command list exists in the file commandModule.js

The comamnds follow the pattern,
commands.[command name] = (data, command) => {  }  
commands.[command name].argumentCount = 1;  
commands.[command name].help = "/<command name> [<command name>] Info for how to use an individual command";

I'm trying to put the commands into groups such as <strong>moderatorCommands</strong> (so that the verification that they're being called by a Mod can be centralised), or <strong>botCommands, playlistCommands</strong> so that the /list command can display available commands in logical groups.

Ideally the commands.[command name].help list from that file would be parsed here to act as a manual...oh well, maybe later :-)


FYI: I'm a DBA, not a developer, as anyone whoknows more about javascript than I do will easily tell from the code :-)