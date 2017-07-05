'use strict';

import logger from '../utils/logger';

var timerStarted = false;
var NAMESPACE;
var IO;
var runningJackpots = {
    'TIMER_ONE' : {
        clock: 2000
    },
    'TIMER_TWO' : {
        clock: 3000
    }
};

function handleOnConnection(socket)
{
    var handshake       = socket.handshake,
        jpIdentifier    = handshake.query.jackpotUniqueId;

    // Handle OnJoin
    handleOnJoin(socket, jpIdentifier);

    // On Jackpot bidding
    socket.on('bid', onBid(socket));

    // On disconnect
    socket.on('disconnect', handleOnDisconnect(socket));
}

/**
 * On Jackpot Join
 *
 * @param  {Socket} socket
 * @return {*}
 */
function handleOnJoin(socket, jpIdentifier)
{
    logger.info(`A user with socket id ${socket.id} connected to jackpot ID ${jpIdentifier}`);

    // Create dynamic room
    var roomName = "JACKPOT_ROOM_" + jpIdentifier;

    // Set room name to this socket
    socket.jackpotRoom = roomName;

    // Join this socket to above room
    socket.join(roomName);


    // if(!runningJackpots.hasOwnProperty(jpIdentifier))
    // {
    //     Jackpot.find({
    //         where: {
    //             unique_id: jpIdentifier
    //         }
    //     }).then(function(jp)
    //     {
    //         var plainObj = jp.get({plain: true});

    //         runningJackpots[jpIdentifier] = plainObj;
    //     }).catch(function(err)
    //     {
    //         logger.error("Error on socket connection:: Jackpot not found");
    //     });
    // }
}

/**
 * On Jackpot Bidding
 *
 * @param  {Socket} socket
 * @return {*}
 */
function onBid(socket)
{
    return function(data)
    {
        var room        = socket.jackpotRoom;
        var identifier  = room.replace('JACKPOT_ROOM_', '');
        var jpObj       = runningJackpots[identifier];
        jpObj.clock = jpObj.clock + 10;
        logger.info(`user with socket id ${socket.id} has put a bid`);
    };
}

/**
 * Handle on socket disconnect
 *
 * @param  {Socket} socket
 * @return {*}
 */
function handleOnDisconnect(socket)
{
    return function()
    {
        // leave the room
        socket.leave(socket.jackpotRoom);

        logger.info(`user with socket id ${socket.id} has been disconnected`);
    }
}

/**
 * Emit the constant timer
 *
 * @return {*}
 */
function emitTimer(socket)
{
    var roomName    = socket.jackpotRoom;
    var jpObj  = runningJackpots[roomName.replace('JACKPOT_ROOM_','')];

    socket.broadcast.in(roomName).emit('timer', {time: jpObj.clock});
}

/**
 * Configure Jackpot SocketIO
 *
 * @param  {Socket.IO} socketio
 * @return {*}
 */
export default function(socketio)
{
    IO = socketio;

    // Create Namespace
    var namespace = socketio.of('jackpot');

    NAMESPACE = namespace;

    // On connection
    namespace.on('connection', handleOnConnection);

    startTimer();
}

function startTimer()
{
    setInterval(function()
    {
        var jpIdentifiers = Object.keys(runningJackpots),
            jpObj,
            identifier;

        for(var i = 0; i < jpIdentifiers.length; i++)
        {
            identifier  = jpIdentifiers[i];
            jpObj       = runningJackpots[identifier];

            jpObj.clock = jpObj.clock - 1;


            var seconds = jpObj.clock;

            var days        = Math.floor(seconds/24/60/60);
            var hoursLeft   = Math.floor((seconds) - (days*86400));
            var hours       = Math.floor(hoursLeft/3600);
            var minutesLeft = Math.floor((hoursLeft) - (hours*3600));
            var minutes     = Math.floor(minutesLeft/60);
            var remainingSeconds = seconds % 60;
            if (remainingSeconds < 10) {
                remainingSeconds = "0" + remainingSeconds;
            }
            var time = hours + ":" + minutes + ":" + remainingSeconds;

            NAMESPACE.in('JACKPOT_ROOM_'+identifier).emit('timer', {time: time});

            //socket.broadcast.in('JACKPOT_ROOM_'+identifier).emit('timer', {time: time});
        }

    }, 1000);
}
