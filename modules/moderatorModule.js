const moderatorFunctions = (bot) => {
    return {
        modList: [], //set the afk limit in minutes here

        resetModList: function (bot) {
            this.modList = []
            // bot.speak("I've reset the Mod list: " + this.modList);
        },

        newModerator:function (data, bot) {
            if (this.modList.indexOf(data.userid) === -1)
            {
                this.modList.push(data.userid);
                // bot.speak("I've reset the Mod list: " + this.modList);
            }
        },

        updateModeratorList: function (data, bot) {
            this.modList.splice(this.modList.indexOf(data.userid), 1);
            // bot.speak("I've reset the Mod list: " + this.modList);
        },
    }
}

module.exports = moderatorFunctions;