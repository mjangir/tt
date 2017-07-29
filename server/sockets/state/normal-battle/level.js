import sqldb from '../../../sqldb';
import LevelGame from './level-game';

const JackpotBattleLevel = sqldb.JackpotBattleLevel;

/**
 * Constructor
 * @param {Container}
 * @param {data}
 */
function Level(container, data)
{
    this.levelContainer = container;
    this.jackpot        = container.jackpot;
    this.metaData       = data;
    this.games          = [];
    this.lastGame       = null;
}

Level.prototype.createNewGame = function()
{

}

Level.prototype.findAllGamesByUser = function(userId)
{

}

Level.prototype.findLastGameByUser = function(userId)
{

}

Level.prototype.findFirstGameByUser = function(userId)
{

}

Level.prototype.findCurrentPlayingGameForUser = function(userId)
{

}

export default Level;