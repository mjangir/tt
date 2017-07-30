'use strict';

import {
    EVT_EMIT_UPDATE_MY_NORMAL_BATTLE_INFO
} from '../constants';

export default function(data, socket)
{
	var jackpotInstance         = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId),
    	jackpotUserInstance     = jackpotInstance.getUser(data.userId),
    	normalBattleContainer   = jackpotInstance.normalBattleContainer,
    	response 				= {status: false},
        currentGame,
        currentLevelGameUser,
        socketCurrentRooms,
        socketRoomKeys;

    currentGame = normalBattleContainer.getRunningGameByUserAndLevel(jackpotUserInstance, data.levelUniqueId);

    if(!currentGame)
    {
    	currentGame = normalBattleContainer.getNewGameByUserAndLevel(jackpotUserInstance, data.levelUniqueId);
    }

    if(currentGame)
    {
        socket.join(currentGame.getRoomName());

        // Leave From All Previous Rooms
        socketCurrentRooms  = socket.rooms;
        socketRoomKeys      = Object.keys(socketCurrentRooms);

        if(socketRoomKeys.length > 0)
        {
            for(var p in socketRoomKeys)
            {
                if(socketRoomKeys[p].indexOf('JACKPOT_NORMAL_BATTLE_LEVEL_ROOM_') > -1)
                {
                    socket.leave(socketRoomKeys[p]);
                }
            }
        }

        // Get current level game user
        currentLevelGameUser = currentGame.getUser(jackpotUserInstance);

        // User joined to game successfully
        socket.emit(EVT_EMIT_UPDATE_MY_NORMAL_BATTLE_INFO, {
            jackpotInfo:    {
                uniqueId:    jackpotInstance.getMetaData().uniqueId,
                name:        jackpotInstance.getMetaData().title,
                amount:      jackpotInstance.getMetaData().amount
            },
            levelInfo:      {
                levelName   : currentGame.level.metaData.levelName,
                prizeValue  : currentGame.level.metaData.prizeValue,
                prizeType   : currentGame.level.metaData.prizeType
            },
            userInfo: {
                userId:             currentLevelGameUser.jackpotUser.getMetaData().id,
                name:               currentLevelGameUser.jackpotUser.getMetaData().name,
                availableBids:      currentLevelGameUser.availableBids,
                totalPlacedBids:    currentLevelGameUser.bids.length,
            }
        });

    	currentGame.emitUpdatesToItsRoom(jackpotUserInstance)
    }
}