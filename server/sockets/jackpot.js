'use strict';

import logger from '../utils/logger';
import jackpotState from './state/jackpot';
import moment from 'moment';

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
        pickNewJackpot,
        jackpotUser;

    // Get Jackpot to which user is already joined
    userJackpot = stateInst.getUserJackpot(userId);

    // If user is already joined to a jackpot
    if(userJackpot)
    {
        // Get that JackpotUser instance
        jackpotUser = userJackpot.getUser(userId);

        jackpotUser.isActive = true;

        // If this jackpot is currently being played and user has not quitted yet OR
        // User is joined earlier but the jackpot still has not started, so he can join the same
        if((userJackpot.isCurrentlyBeingPlayed() && jackpotUser.gameStatus != 'QUITTED') || userJackpot.getMetaData().gameStatus == 'NOT_STARTED')
        {
            socket.currentRoom  = userJackpot.getRoomName();
            socket.jackpot      = userJackpot;
            socket.jackpotUser  = jackpotUser;

            socket.join(userJackpot.getRoomName());

            socket.emit('me_joined', {
                jackpotUniqueId: userJackpot.getMetaData().uniqueId
            });
            userJackpot.emitUpdatesToItsRoom();
        }
        else
        {
            // Otherwise pickup a new jackpot which is currently being played and its
            // Doomsday is not overed OR any jackpot which is not started yet
            pickNewJackpot = stateInst.pickupNewJackpot();
        }
    }
    else
    {
        // If this is very new user, get a new jackpot for him
        pickNewJackpot = stateInst.pickupNewJackpot();
    }

    // If this is really new user, add him/her to this jackpot room
    if(typeof pickNewJackpot != 'undefined')
    {
        pickNewJackpot.addUser(userId, function(error, jackpotUser)
        {
            if(error == null)
            {
                socket.currentRoom  = pickNewJackpot.getRoomName();
                socket.jackpot      = pickNewJackpot;
                socket.jackpotUser  = jackpotUser;

                socket.join(pickNewJackpot.getRoomName());
                socket.emit('me_joined', {
                    jackpotUniqueId: pickNewJackpot.getMetaData().uniqueId
                });
                pickNewJackpot.emitUpdatesToItsRoom();
            }
            else
            {
                socket.emit('me_join_error', {error: error});
            }
        });
    }


    // Register Further Events
    socket.on('place_bid', (function(socket)
    {
        return function(data)
        {
            handlePlaceNewBid(data, socket);
        };
    }(socket)));

    // On socket disconnect
    socket.on('disconnect', function()
    {
        socket.jackpotUser.isActive = false;
        global.jackpotSocketNamespace.in(socket.currentRoom).emit('updated_jackpot_data', socket.jackpot.getUpdatedJackpotData());
        
    });
}

function handlePlaceNewBid(data, socket)
{
    var jackpotInstance,
        jackpotUserInstance,
        newBid;

    if(!data.jackpotUniqueId || !data.userId || !global.globalJackpotSocketState.hasJackpot(data.jackpotUniqueId))
    {
        socket.emit('place_bid_error', {
            error: "Invalid User or Jackpot ID"
        });
    }
    else
    {
        jackpotInstance     = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId);
        jackpotUserInstance = jackpotInstance.getUser(data.userId);
    }

    if(jackpotInstance.isNotStarted())
    {
        jackpotInstance.startGame();
    }
    
    newBid = jackpotUserInstance.placeNewBid();

    jackpotInstance.increaseGameClockOnNewBid();

    jackpotInstance.updateLastBidDuration(newBid, jackpotUserInstance);

    jackpotInstance.emitUpdatesToItsRoom();

    socket.emit('can_i_bid', {canIBid: false});
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
            doomsDayTime,
            lastBidDuration;

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
            lastBidDuration = jackpot.getHumanLastBidDuration();

            // Emit the updated jackpot timer to everybody in its room
            global.jackpotSocketNamespace.in(roomName).emit('update_jackpot_timer', {
                gameClockTime:      gameClockTime,
                doomsDayClockTime:  doomsDayTime,
                lastBidDuration:    lastBidDuration
            });
        }
    }, 1000);
}
