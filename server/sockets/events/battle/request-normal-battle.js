'use strict';

import {
	EVT_EMIT_RESPONSE_BATTLE
} from './constants';

export default function(data, socket)
{
	var jackpotInstance         = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId),
    	jackpotUserInstance     = jackpotInstance.getUser(data.userId),
    	normalBattleContainer   = jackpotInstance.normalBattleContainer,
    	battleLevelsList 		= normalBattleContainer.getBattleLevelListByUser(data.userId),
    	currentlyPlayingGame 	= normalBattleContainer.getRunningGameByUser(jackpotUserInstance),
        currentGameInfo         = false,
        myGameUserInstance,
        socketCurrentRooms,
        socketRoomKeys,
        previousRoomName,
        response;

    if(currentlyPlayingGame)
    {
        // Leave From All Previous Rooms
        socketCurrentRooms  = socket.rooms;
        socketRoomKeys      = Object.keys(socketCurrentRooms);

        if(socketRoomKeys.length > 0)
        {
            for(var p in socketRoomKeys)
            {
                if(socketRoomKeys[p].indexOf('JACKPOT_NORMAL_BATTLE_LEVEL_ROOM_') > -1)
                {
                    previousRoomName = socketRoomKeys[p];
                }
            }
        }

        // Leave from old Room and join again
        socket.leave(previousRoomName, function()
        {
            socket.join(currentlyPlayingGame.getRoomName());

            myGameUserInstance = currentlyPlayingGame.getUser(jackpotUserInstance);

            currentGameInfo = {
                jackpotInfo:    {
                    uniqueId:    jackpotInstance.getMetaData().uniqueId,
                    name:        jackpotInstance.getMetaData().title,
                    amount:      jackpotInstance.getMetaData().amount
                },
                levelInfo: {
                    duration    : currentlyPlayingGame.getHumanDuration(),
                    uniqueId    : currentlyPlayingGame.level.uniqueId,
                    levelName   : currentlyPlayingGame.level.metaData.levelName,
                    prizeValue  : currentlyPlayingGame.level.metaData.prizeValue,
                    prizeType   : currentlyPlayingGame.level.metaData.prizeType
                },
                myInfo: {
                    userId:             myGameUserInstance.jackpotUser.getMetaData().id,
                    name:               myGameUserInstance.jackpotUser.getMetaData().name,
                    availableBids:      myGameUserInstance.availableBids,
                    totalPlacedBids:    myGameUserInstance.bids.length
                },
                players             : currentlyPlayingGame.getAllActiveUsersInfo(),
                currentBidUser      : currentlyPlayingGame.getLastBidUser() == null ? null : currentlyPlayingGame.getLastBidUser().jackpotUser.metaData.name,
                currentBidDuration  : currentlyPlayingGame.getLastBid() == null ? null : currentlyPlayingGame.getLastBid().duration,
                longestBidUser      : currentlyPlayingGame.getLongestBidUser() == null ? null : currentlyPlayingGame.getLongestBidUser().jackpotUser.metaData.name,
                longestBidDuration  : currentlyPlayingGame.getLongestBid() == null ? null : currentlyPlayingGame.getLongestBid().duration,
            };

            response = {
                battleType         : 'NORMAL',
                battleLevelsList   : battleLevelsList,
                currentGameInfo    : currentGameInfo
            };

            socket.emit(EVT_EMIT_RESPONSE_BATTLE, response);

        });
    }
    else
    {
        response = {
            battleType         : 'NORMAL',
            battleLevelsList   : battleLevelsList,
            currentGameInfo    : currentGameInfo
        }
        socket.emit(EVT_EMIT_RESPONSE_BATTLE, response);
    }
}