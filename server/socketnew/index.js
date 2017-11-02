'use strict';

import logger from '../utils/logger';
import createGlobalGameState from './game-state';

/**
 * Configure socketio for both Jackpot and Money Battle
 *
 * @param  {Object} socketio
 * @return {*}
 */
export default function(socketio)
{
    global.ticktockGameState = {
        settings            : [],
        users               : [],
        jackpots            : [],
        moneyBattleLevels   : [],
        jackpotSocketNs     : null,
        moneyBattleSocketNs : null,
        socketIO            : socketio
    }

    // Create Global Game State
    createGlobalGameState(socketio).then(function()
    {

    }).catch(function(err)
    {
        logger.error(err);
    });
}