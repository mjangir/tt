'use strict';

import logger from '../utils/logger';
import jackpotState from './state/jackpot';

/**
 * Configure Jackpot SocketIO
 *
 * @param  {Socket.IO} socketio
 * @return {*}
 */
export default function(socketio)
{
    // Store all jackpots in memory
    global.globalJackpotSocketState = new jackpotState((function(socketio)
    {
        var IO = socketio;

        return function()
        {
            // Create Namespace
            var namespace = socketio.of('jackpot');

            // Register as global namespace
            global.jackpotSocketNamespace = namespace;

            // On connection
            namespace.on('connection', handleOnConnection);

            // Start cound down of all jackpot's game clock and doomsday clock
            startJackpotsClockCountDown();
        }

    }(socketio)));
}

/**
 * Handle On Socket Connection
 *
 * @param  {Socket} socket
 * @return {*}
 */
function handleOnConnection(socket)
{
    var stateInst   = global.globalJackpotSocketState,
        handshake   = socket.handshake,
        userId      = handshake.query.userId,
        userJackpot,
        pickNewJackpot;

    // Get Jackpot to which user is already joined
    userJackpot = stateInst.getUserJackpot(userId);

    // If no Jackpot found, then get a new jackpot for this user
    if(!userJackpot || !userJackpot.isCurrentlyBeingPlayed())
    {
        pickNewJackpot = stateInst.pickupNewJackpot();
    }

    // If new Jackpot found, add this user to it's room and emit
    // updates to all the users joined in this room
    if(pickNewJackpot)
    {
        pickNewJackpot.addUser(userId);
        socket.join(pickNewJackpot.getRoomName());
        pickNewJackpot.emitUpdatesToItsRoom();
    }
}

function startJackpotsClockCountDown()
{
    // Decrease the Jackpots clock if they are in "STARTED" status
    setInterval(function()
    {
        var jackpotInstances    = global.globalJackpotSocketState.getJackpots(),
            uniqueIds           = Object.keys(jackpotInstances),
            length              = uniqueIds.length,
            jackpot,
            metaData,
            uniqueId,
            roomName,
            gameClockTime,
            doomsDayTime;

        for(var i = 0; i < length; i++)
        {
            uniqueId    = uniqueIds[i];
            jackpot     = jackpotInstances[uniqueId];
            metaData    = jackpot.getMetaData();

            // If both game and dooms day clock has become zero
            // Finish this game
            if(metaData.gameClockRemaining == 0 && metaData.doomsDayRemaining == 0)
            {
                jackpot.finishGame();
            }

            // Count down the jackpot if game is in "STARTED" status
            if(metaData.gameStatus == 'STARTED')
            {
                jackpot.countDown();
            }

            // Get counted down time
            roomName        = jackpot.getRoomName();
            gameClockTime   = jackpot.getHumanGameClock();
            doomsDayTime    = jackpot.getHumanDoomsDayClock();

            // Emit the updated jackpot timer to everybody in its room
            global.jackpotSocketNamespace.in(roomName).emit('update_jackpot_timer', {
                gameClockTime:      gameClockTime,
                doomsDayClockTime:  doomsDayTime
            });
        }
    }, 1000);
}
