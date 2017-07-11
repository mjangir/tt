'use strict';

/**
 * On Socket Disconnect
 *
 * @param  {Socket} socket
 * @return {*}
 */
export default function(socket)
{
    return function()
    {
        socket.jackpotUser.isActive = false;
        global.jackpotSocketNamespace.in(socket.currentRoom).emit('updated_jackpot_data', socket.jackpot.getUpdatedJackpotData());
    }
}