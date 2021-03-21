module.exports = {
    theUsersList: [], //holds the name and userid of everyone in the room
    queueName: [], //holds just the name of everyone who is in the queue
    queueList: [], //holds the name and userid of everyone in the queue
    afkPeople: [], //holds the userid of everyone who has used the /afk command


    bannedUsers: ['636473737373', 'bob', '535253533353', 'joe'], //banned users list, put userids in string form here for permanent banning(put their name after their userid to tell who is banned).
    bannedFromStage: ['636473737373', 'bob', '535253533353', 'joe'], //put userids in here to ban from djing permanently(put their name after their userid to tell who is banned)
    vipList: [],
    /* this is the vip list, it accepts userids as input, this is for when you have a special guest or guests in your room and you only
       want to hear them dj, leave this empty unless you want everyone other than the people whos userids are in the vip list to be automatically kicked from stage.
    */

    masterIds: ['6040a0333f4bfc001be4cf39'], //example (clear this before using)
    /*  This is the master id list, userid's that are put in here will not be affected by the song length limit, artist / song banning, the /skip command, or the dj afk limit.
        This is meant to explicitly give extra privileges to yourself and anyone else you want to put in here. It takes userid's as input in string format separated by commas.
        You can put the person's name in the array either before or after a userid to tell who it belongs to, it will not affect its ability to function.
    */

    resetUsersList: function (bot) {
        this.theUsersList = []
        bot.speak("I've reset the Users list");
    },

    resetQueueNames: function (bot) {
        this.queueName = []
        bot.speak("I've reset the Queue Names");
    },

    resetQueueList: function (bot) {
        this.queueList = []
        bot.speak("I've reset the Queue List");
    },

    resetAFKPeople: function (bot) {
        this.afkPeople = []
        bot.speak("I've reset the AFK List");
    },

    updateUser: function (data) {
        if (typeof data.name === 'string') {
            let oldname = ''; //holds users old name if exists
            let queueNamePosition;
            let queueListPosition;
            let afkPeoplePosition;

            //when when person updates their profile
            //and their name is not found in the users list then they must have changed
            //their name
            if (this.theUsersList.indexOf(data.name) === -1) {
                let nameIndex = this.theUsersList.indexOf(data.userid);
                if (nameIndex !== -1) //if their userid was found in theUsersList
                {
                    oldname = this.theUsersList[nameIndex + 1];
                    this.theUsersList[nameIndex + 1] = data.name;

                    if (typeof oldname !== 'undefined') {
                        queueNamePosition = this.queueName.indexOf(oldname);
                        queueListPosition = this.queueList.indexOf(oldname);
                        afkPeoplePosition = this.afkPeople.indexOf(oldname);


                        if (queueNamePosition !== -1) //if they were in the queue when they changed their name, then replace their name
                        {
                            this.queueName[queueNamePosition] = data.name;
                        }

                        if (queueListPosition !== -1) //this is also for the queue
                        {
                            this.queueList[queueListPosition] = data.name;
                        }

                        if (afkPeoplePosition !== -1) //this checks the afk list
                        {
                            this.afkPeople[afkPeoplePosition] = data.name;
                        }
                    }
                }
            }
        }
    },
}