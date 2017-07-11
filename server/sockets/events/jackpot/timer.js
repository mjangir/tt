'use strict';

import {
    EVT_EMIT_UPDATE_JACKPOT_TIMER,
    EVT_EMIT_GAME_FINISHED,
    EVT_EMIT_SHOW_QUIT_BUTTON
} from './constants';

/**
 * Finish Game Callback
 *
 * @param  {Jackpot} jackpot
 * @param  {Object} fullData
 * @return {*}
 */
function finishGameCallback(jackpot, fullData)
{
    var roomName = jackpot.getRoomName();

    global.jackpotSocketNamespace.in(roomName).emit(EVT_EMIT_GAME_FINISHED, {
        data: fullData
    });
}

/**
 * Jackpot timer that will be running always to get the
 * game clock and doomsday timing
 *
 * @return {*}
 */
export default function()
{
    /**
     * Run a callback every 1 second
     *
     * @param  Function
     * @return {*}
     */
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
            lastBidDuration,
            longestBidDuration;

        // Run for all jackpots
        for(var i = 0; i < length; i++)
        {
            uniqueId    = uniqueIds[i];
            jackpot     = jackpotInstances[uniqueId];
            metaData    = jackpot.getMetaData();

            // If both game and dooms day clock has become zero
            // Finish this game
            if(metaData.gameClockRemaining == 0 && metaData.gameStatus == 'STARTED')
            {
                jackpot.finishGame(finishGameCallback);
                return;
            }

            // If game clock is running but doomsday is over, show quit button
            if(metaData.gameClockRemaining > 0 && metaData.doomsDayRemaining <= 0)
            {
                global.jackpotSocketNamespace.in(jackpot.getRoomName()).emit(EVT_EMIT_SHOW_QUIT_BUTTON, {
                    status: true
                });
            }

            // Count down the jackpot if game is in "STARTED" status
            if(metaData.gameStatus == 'STARTED')
            {
                jackpot.countDown();
            }

            // Get counted down time
            roomName            = jackpot.getRoomName();
            gameClockTime       = jackpot.getHumanGameClock();
            doomsDayTime        = jackpot.getHumanDoomsDayClock();
            lastBidDuration     = jackpot.getHumanLastBidDuration();
            longestBidDuration  = jackpot.getLongestBidDuration(true);

            // Emit the updated jackpot timer to everybody in its room
            global.jackpotSocketNamespace.in(roomName).emit(EVT_EMIT_UPDATE_JACKPOT_TIMER, {
                gameClockTime       : gameClockTime,
                doomsDayClockTime   : doomsDayTime,
                lastBidDuration     : lastBidDuration,
                longestBidDuration  : longestBidDuration
            });
        }
    }, 1000);
}