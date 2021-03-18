module.exports = {
    modList: [], //set the afk limit in minutes here

    resetModList: function (bot) {
        let modList = []
        bot.speak("I've reset the Mod list: " + this.modList);
    },

    newModerator:function (bot, data) {
        if (this.modList.indexOf(data.userid) === -1)
        {
            this.modList.push(data.userid);
            bot.speak("I've reset the Mod list: " + this.modList);
        }
    },

    updateModeratorList: function (bot, data) {
        this.modList.splice(this.modList.indexOf(data.userid), 1);
        bot.speak("I've reset the Mod list: " + this.modList);
    },

}