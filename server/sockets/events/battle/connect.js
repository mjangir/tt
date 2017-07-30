import onRequestBattle from './requestbattle';
import playNormalBattleLevel from './normal/play-battle-level';
import playGamblingBattleLevel from './gambling/play-battle-level';

import {
	EVT_ON_CLIENT_REQUEST_BATTLE,
	EVT_CLIENT_PLAY_JACKPOT_BATTLE_LEVEL
} from './constants';

export default function(socket)
{
	// On battle tab click request
    socket.on(EVT_ON_CLIENT_REQUEST_BATTLE, onRequestBattle(socket));

    // On battle tab click request
    socket.on(EVT_CLIENT_PLAY_JACKPOT_BATTLE_LEVEL, (function(socket){

    	return function(data)
		{
			if(data.battleType == 'NORMAL')
			{
				playNormalBattleLevel(data, socket);
			}
			else if(data.battleType == 'GAMBLING')
			{
				playGamblingBattleLevel(data, socket);
			}
		}
    }(socket)));
}