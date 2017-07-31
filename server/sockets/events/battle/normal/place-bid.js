'use strict';

import {
    EVT_EMIT_RESPONSE_PLACE_NORMAL_BATTLE_LEVEL_BID
} from '../constants';


function handlePlaceBid(data, socket)
{
    var jackpotInstance         = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId),
        jackpotUserInstance     = jackpotInstance.getUser(data.userId),
        normalBattleContainer   = jackpotInstance.normalBattleContainer,
        currentBattleLevel      = normalBattleContainer.getLevelByUniqueId(data.levelUniqueId),
        currentBattleGame       = currentBattleLevel ? currentBattleLevel.getGameByUniqueId(data.gameUniqueId) : false,
        currentGameUser;

    if(currentBattleGame)
    {
        currentGameUser = currentBattleGame.getUser(jackpotUserInstance);
        currentBattleGame.placeBid(currentGameUser, function()
        {
            // Update the socket itself
            socket.emit(EVT_EMIT_RESPONSE_PLACE_NORMAL_BATTLE_LEVEL_BID, {
                totalPlacedBids: currentGameUser.getAllBids().length,
                availableBids: currentGameUser.availableBids
            });

            // Update the new detail to all room members
            currentBattleGame.emitUpdatesToItsRoom();
        });
    }
}

export default function(socket)
{
    return function(data)
    {
        handlePlaceBid(data, socket);
    };
}