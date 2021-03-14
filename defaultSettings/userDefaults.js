module.exports = {
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

}
