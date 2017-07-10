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

function handleOnConnection(socket)
{
    var stateInst   = global.globalJackpotSocketState,
        handshake   = socket.handshake,
        userId      = handshake.query.userId,
        userJackpot,
        pickNewJackpot;

    userJackpot = stateInst.getUserJackpot(userId);

    if(!userJackpot || !userJackpot.isCurrentlyBeingPlayed())
    {
        pickNewJackpot = stateInst.pickupNewJackpot();
    }

    if(pickNewJackpot)
    {
        pickNewJackpot.addUser(userId);
        socket.join(pickNewJackpot.getRoomName());
        pickNewJackpot.emitUpdatesToItsRoom();
    }
}

function startJackpotsClockCountDown()
{
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

            // Count down the jackpot if game started
            if(metaData.gameStatus != 'STARTED')
            {
                jackpot.countDown();
            }

            // Get counted down time
            roomName        = jackpot.getRoomName();
            gameClockTime   = jackpot.getHumanGameClock();
            doomsDayTime    = jackpot.getHumanDoomsDayClock();

            global.jackpotSocketNamespace.in(roomName).emit('update_jackpot_timer', {
                gameClockTime:      gameClockTime,
                doomsDayClockTime:  doomsDayTime
            });
        }
    }, 1000);
}
