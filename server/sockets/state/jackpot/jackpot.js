'use strict';

import User from './user';

function Jackpot(data)
{
    this.metaData   = data;
    this.users      = {};

    this.setRoomName();
}

Jackpot.prototype.setRoomName = function()
{
    var roomPrefix  = 'JACKPOT_ROOM_';
    var uniqueId    = this.metaData.uniqueId;
    var roomName    = roomPrefix + uniqueId;
    this.roomName   = roomName;
}

Jackpot.prototype.getRoomName = function()
{
    return this.roomName;
}

Jackpot.prototype.countDown = function()
{
    this.metaData.gameClockRemaining    -= 1;
    this.metaData.doomsDayRemaining     -= 1;
}

Jackpot.prototype.getMetaData = function()
{
    return this.metaData;
}

Jackpot.prototype.getHumanGameClock = function()
{
    return this.convertSecondsToCounterTime(this.metaData.gameClockRemaining);
}

Jackpot.prototype.getHumanDoomsDayClock = function()
{
    return this.convertSecondsToCounterTime(this.metaData.doomsDayRemaining);
}

Jackpot.prototype.hasUser = function(userId)
{
    return this.users.hasOwnProperty(userId);
}

Jackpot.prototype.isCurrentlyBeingPlayed = function()
{
    return this.metaData.gameStatus == 'STARTED';
}

Jackpot.prototype.emitUpdatesToItsRoom = function()
{
    var roomName = this.getRoomName();

    global.jackpotSocketNamespace.in(roomName).emit('updated_jackpot_data', {data: this.getUpdatedJackpotData()});
}

Jackpot.prototype.getUpdatedJackpotData = function()
{
    return {
        totalUsers: this.users.length
    }
}

Jackpot.prototype.addUser = function(userId)
{
    if(this.users.hasOwnProperty(userId))
    {
        return this.users[userId];
    }

    this.users[userId] = new User(userId);

    return this.users[userId];
}

Jackpot.prototype.removeUser = function()
{

}

Jackpot.prototype.convertSecondsToCounterTime = function(seconds)
{
    var days                = Math.floor(seconds/24/60/60),
        hoursLeft           = Math.floor((seconds) - (days*86400)),
        hours               = Math.floor(hoursLeft/3600),
        minutesLeft         = Math.floor((hoursLeft) - (hours*3600)),
        minutes             = Math.floor(minutesLeft/60),
        remainingSeconds    = seconds % 60;

    if(hours < 10)
    {
        hours = "0" + hours;
    }

    if(minutes < 10)
    {
        minutes = "0" + minutes;
    }

    if(remainingSeconds < 10)
    {
        remainingSeconds = "0" + remainingSeconds;
    }

    return hours + ":" + minutes + ":" + remainingSeconds;
}

export default Jackpot;