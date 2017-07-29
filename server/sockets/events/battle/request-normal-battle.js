'use strict';

import {
	EVT_EMIT_RESPONSE_BATTLE
} from './constants';

export default function(data, socket)
{
	var jackpotInstance         = global.globalJackpotSocketState.getJackpot(data.jackpotUniqueId);
    	jackpotUserInstance     = jackpotInstance.getUser(data.userId);
    	normalBattleContainer   = jackpotInstance.normalBattleContainer,
    	battleLevelsList 		= normalBattleContainer.getBattleLevelListByUser(data.userId),
    	currentlyPlayingGame 	= normalBattleContainer.getCurrentlyPlayingGameByUser(data.userId);

    var response = {
    	battleType 		 	 : 'NORMAL',
    	battleLevelsList 	 : battleLevelsList,
    	currentlyPlayingGame : currentlyPlayingGame
    }
}