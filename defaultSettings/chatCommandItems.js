// format messages using @senderUsername and @receiverUsername
// they will be replaced inside the chat functions

module.exports = {
    // selection of lines to pick for functions
    stageDiveMessages: [
        "@senderUsername flies through the air with the greatest of ease",
        "CANNONBALL!!! @senderUsername incoming",
        "People on the floor beware, @senderUsername is coming down fast!",
        "Screw you guys, @senderUsername is going home!",
        "@senderUsername dives off the stage feet first but nobody is there to catch them"
    ],

    queueInviteMessages: [
        "@username you have :time: to get on stage...",
        "OK @username, you're up! You have less than :time: to hit the DJ booth",
        "@username...COME ON DOWN, erm, up. :time: left or someone else gets your spot",
        "in :time: it'll be time for @username to DJ...hope they're ready!",
        "@username, see that free DJ slot? It's got youur name on it for the next :time:",
        "fine...I suppose it's time we let @username play a couple of tunes. You have :time: left!",
        "drum roll please...it's time for @username to DJ. :time: left to get up there!"
    ],

    roomJoinMessages: [
        ""
    ],

    // Multi part message data
    martikaMessages: [
        [ [ 'M', 1000 ], [ 'A', 1000 ], [ 'R', 1000 ], [ 'T', 1000 ], [ 'I', 1000 ], [ 'K', 1000 ], [ 'A', 1000 ], ]
    ],

    martikaPics: [
        "https://media.giphy.com/media/TiVjsGVRBBb7GBzszq/giphy.gif",
    ],

    monkeyMessages: [
        [ [ 'Shock', 250 ], [ 'the', 250 ], [ 'Monkey', 250 ] ],
        [ [ 'Schockt', 1000 ], [ 'Schockt', 1000 ], [ 'Schockt', 2000 ], [ 'Schockt', 250 ], [ 'den', 250 ], [ 'Affen', 250 ] ]
    ],

    monkeyPics: [
        "https://media.giphy.com/media/1iUZa41YxKQtaJq0/source.gif",
        "https://media.giphy.com/media/26uf9OZQN3QWgiRz2/source.gif",
        "https://media.giphy.com/media/OYJ2kbvdTPW6I/source.gif",
        "https://media.giphy.com/media/3o6ZsZB89MSzlDo5pe/source.gif",
        "https://media.giphy.com/media/3o6Ztpej1dvqSwvdLy/source.gif"
    ]

}
