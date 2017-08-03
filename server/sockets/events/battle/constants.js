'use strict';

export const EVT_ON_CLIENT_REQUEST_BATTLE 						= 'request_battle';
export const EVT_CLIENT_JOIN_NORMAL_BATTLE_LEVEL        		= 'request_join_normal_battle_level';
export const EVT_CLIENT_REQUEST_PLACE_NORMAL_BATTLE_LEVEL_BID  	= 'request_place_normal_battle_level_bid';

export const EVT_EMIT_RESPONSE_BATTLE      						= 'response_battle';
export const EVT_EMIT_RESPONSE_JOIN_NORMAL_BATTLE_LEVEL 	 	= 'response_join_normal_battle_level';
export const EVT_EMIT_RESPONSE_PLACE_NORMAL_BATTLE_LEVEL_BID 	= 'response_place_normal_battle_level_bid';

export const EVT_EMIT_UPDATE_NORMAL_BATTLE_LEVEL_PLAYER_LIST    = 'update_normal_battle_level_player_list';
export const EVT_EMIT_NORMAL_BATTLE_LEVEL_TIMER                 = 'update_normal_battle_level_timer';
export const EVT_EMIT_NORMAL_BATTLE_GAME_STARTED                = 'normal_battle_level_game_started';

export const EVT_EMIT_HIDE_NBL_PLACE_BID_BUTTON                 = 'hide_normal_battle_level_place_bid_button';
export const EVT_EMIT_SHOW_NBL_PLACE_BID_BUTTON                 = 'show_normal_battle_level_place_bid_button';
export const EVT_EMIT_NBL_GAME_FINISHED                         = 'normal_battle_level_game_finished';