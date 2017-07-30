import sqldb from '../../../sqldb';
import Level from './level';

const JackpotBattleLevel = sqldb.JackpotBattleLevel;

/**
 * Constructor
 * @param {Jackpot}
 */
function Container(jackpot)
{
    this.jackpot    = jackpot;
    this.levels     = {};

    //Init
    this.init();
}

/**
 * Init the state
 *
 * @return {Mixed}
 */
Container.prototype.init = function()
{
    var context = this;

    JackpotBattleLevel.findAll({
        raw : true,
        where: {
            battleType: 'NORMAL',
            jackpotId: context.jackpot.metaData.id
        }
    }).then(function(levels)
    {
        if(levels.length > 0)
        {
            for(var i = 0; i < levels.length; i++)
            {
                var level = levels[i],
                    order = parseInt(level.order, 10);

                context.levels[order] = new Level(context, level);
            }

            if(typeof context.callback == 'function')
            {
                context.callback.call(global);
            }
        }
    }).catch(function(error)
    {
        return false;
    });
}

Container.prototype.getLevelByUniqueId = function(levelUniqueId)
{
    var levels = this.levels,
        level;

    if(levels.length <= 0)
    {
        return false;
    }

    for(var k in levels)
    {
        level = levels[k];

        if(level.uniqueId == levelUniqueId)
        {
            return level;
        }
    }

    return false;
}

Container.prototype.getRunningGameByUserAndLevel = function(jackpotUser, levelUniqueId)
{
    var level = this.getLevelByUniqueId(levelUniqueId);
    return (!level) ? false : level.getRunningGameByUser(jackpotUser);
}

Container.prototype.getNewGameByUserAndLevel = function(jackpotUser, levelUniqueId)
{
    var level = this.getLevelByUniqueId(levelUniqueId);
    return (!level) ? false : level.getNewGameByUser(jackpotUser);
}

Container.prototype.getBattleLevelListByUser = function(userId)
{
    var firstLevel  = this.levels[1],
        metaData;

    if(!firstLevel)
    {
        return [];
    }

    metaData = firstLevel.metaData;

    return [{
        uniqueId                : firstLevel.uniqueId,
        order                   : metaData.order,
        levelName               : metaData.levelName,
        prizeType               : metaData.prizeType,
        prizeValue              : metaData.prizeValue,
        defaultAvailableBids    : metaData.defaultAvailableBids,
        isLastLevel             : metaData.isLastLevel
    }];
}

Container.prototype.updateTimer = function()
{
    var levels = this.levels,
        level;

    if(Object.keys(levels).length > 0)
    {
        for(var k in levels)
        {
            if(levels.hasOwnProperty(k))
            {
                level = levels[k];
                level.updateTimer();
            }
        }
    }
}

// Export Jackpot
export default Container;