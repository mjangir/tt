import sqldb from '../../../sqldb';

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
            battleType: 'GAMBLING',
            jackpotId: context.jackpot.metaData.id
        }
    }).then(function(levels)
    {
        if(levels.length > 0)
        {
            for(var i = 0; i < levels.length; i++)
            {
                var level = levels[i];
                context.levels[level.order] = level;
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

// Export Jackpot
export default Container;