'use strict';

import jackpot from './jackpot';
import battle from './battle';

/**
 * Configure socketio for both Jackpot and Battle
 *
 * @param  {Object} socketio
 * @return {*}
 */
export default function(socketio)
{
    // Configure jackpot socket.io
    jackpot(socketio);

    // Configure battle socket.io
    battle(socketio);
}