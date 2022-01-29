*Bot to manage queues, and give info for music rooms on Turntable.fm.*

The intention for this fork is to modularise the code to make it easier to configure and be more maintainable

Forked from Mr. Roboto https://github.com/jakewillsmith/roboto

Forked from chillybot: https://github.com/samuri51/chillybot

### Introduction
My intention here was to make the bot easier to maintain and add/modify commands. I've tried to modularise the commands into their own functions, and to move parameters into relevant objects.

### What's here...
There are 2 bots in this repo. The actual turntable.fm bot called <strong>DaManagement.js</strong> and a small bot called <strong>chatBot.js</strong> (that also connects to turntable.fm) that I've been using to test concepts, and learn a bit more about how to do things in javascript.

Individual documentation for each, and instructions on how to deploy/use the main bot, can be found in the `Documentation` folder

### Linting and code formatting
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
  

### Testing
Thanks to an actual, genuine, honest to goodness developer @1hitsong the bot now has some king of testing framework that hopefully we can build on.

To  run the tests use the command
```
npm test
```
The tests are written using Jest, so you'll either need to know how that works, or read the existing tests and figure it out (like I'm currently doing). If you need some more help there's documentation here: https://jestjs.io

### Disclaimer ;-)

FYI: I'm a DBA, not a developer, as anyone who knows more about javascript than I do will easily tell from the code :-)
