'use strict';

import sqldb from '../../../sqldb';
import Jackpot from './jackpot';

const JackpotModel = sqldb.Jackpot;

function JackpotState(callback)
{
    this.callback = callback;
    this.jackpots = {};

    this.init();
}

JackpotState.prototype.init = function()
{
    var context = this;

    JackpotModel.findAll({raw : true}).then(function(jackpots)
    {
        if(jackpots.length > 0)
        {
            for(var i = 0; i < jackpots.length; i++)
            {
                context.addJackpot(jackpots[i]);
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

JackpotState.prototype.getJackpots = function()
{
    return this.jackpots;
}

JackpotState.prototype.addJackpot = function(data)
{
    var uniqueId = data.uniqueId;

    if(!uniqueId)
    {
        return;
    }

    if(this.jackpots.hasOwnProperty(uniqueId))
    {
        return this.jackpots[uniqueId];
    }

    this.jackpots[uniqueId] = new Jackpot(data);
}

JackpotState.prototype.updateJackpot = function(uniqueId, data)
{
    if(!this.jackpots[uniqueId])
    {
        return;
    }

    var jackpot = this.jackpots[uniqueId];

    jackpot.updateData(data);

    return this;
}

JackpotState.prototype.removeJackpot = function(uniqueId)
{
    if(!this.jackpots[uniqueId])
    {
        return;
    }

    delete this.jackpots[uniqueId];

    return this;
}

JackpotState.prototype.getUserJackpot = function(userId)
{
    var jackpots    = this.jackpots,
        length      = jackpots.length,
        jackpot;

    if(length)
    {
        for(var i = 0; i < length; i++)
        {
            jackpot = jackpots[i];

            if(jackpot.hasUser(userId))
            {
                return jackpot;
            }
        }
    }

    return false;
}

JackpotState.prototype.pickupNewJackpot = function()
{
    var jackpots    = this.jackpots,
        uniqueIds   = Object.keys(jackpots),
        length      = uniqueIds.length,
        uniqueId,
        jackpot;

    if(length > 0)
    {
        for(var i = 0; i < length; i++)
        {
            uniqueId    = uniqueIds[i];
            jackpot     = jackpots[uniqueId];
            if(jackpot.getMetaData().gameStatus == 'NOT_STARTED')
            {
                return jackpot;
            }
        }
    }

    return false;
}

export default JackpotState;