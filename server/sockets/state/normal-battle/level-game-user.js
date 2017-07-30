import sqldb from '../../../sqldb';

/**
 * Constructor
 * @param {data}
 */
function LevelGameUser(levelGame, jackpotUser)
{
	this.game 			= levelGame,
    this.jackpotUser   	= jackpotUser;
    this.isActive   	= true;
    this.gameStatus 	= 'JOINED';
    this.joinedOn   	= new Date();
    this.bids 			= [];
    this.availableBids 	= this.game.level.metaData.defaultAvailableBids;
}

LevelGameUser.prototype.getMyAllBids = function()
{
	return this.bids;
}

export default LevelGameUser;