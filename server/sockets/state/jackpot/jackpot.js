'use strict';

import sqldb from '../../../sqldb';
import User from './user';
import lodash from 'lodash';

const UserModel = sqldb.User;

function Jackpot(data)
{
    this.metaData   	= data;
    this.users      	= {};
    this.lastBid 		= null;
    this.lastBidUser  	= null;

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
    var time = this.convertSecondsToCounterTime(this.metaData.gameClockRemaining);
	return time.hours + ":" + time.minutes + ":" + time.seconds;
}

Jackpot.prototype.getHumanDoomsDayClock = function()
{
	var time = this.convertSecondsToCounterTime(this.metaData.doomsDayRemaining);
	return time.hours + ":" + time.minutes + ":" + time.seconds;
}

Jackpot.prototype.getHumanLastBidDuration = function()
{
	var time = this.lastBid != null ? this.convertSecondsToCounterTime(this.lastBid.getRealTimeDuration()) : {minutes: '00', seconds: '00'};
	return time.minutes + ":" + time.seconds;
}

Jackpot.prototype.hasUser = function(userId)
{
    return this.users.hasOwnProperty(userId);
}

Jackpot.prototype.getUser = function(userId)
{
    return this.users[userId] ? this.users[userId] : false;
}

Jackpot.prototype.isCurrentlyBeingPlayed = function()
{
    return this.metaData.gameStatus == 'STARTED';
}

Jackpot.prototype.isNotStarted = function()
{
	return this.metaData.gameStatus == 'NOT_STARTED';
}

Jackpot.prototype.startGame = function()
{
    this.metaData.gameStatus = 'STARTED';
}

Jackpot.prototype.finishGame = function()
{
    this.metaData.gameStatus = 'FINISHED';
}

Jackpot.prototype.emitUpdatesToItsRoom = function()
{
    var roomName = this.getRoomName();

    global.jackpotSocketNamespace.in(roomName).emit('updated_jackpot_data', this.getUpdatedJackpotData());
}

Jackpot.prototype.getUpdatedJackpotData = function()
{
	var placedBids 	= this.getAllBids();

	if(this.isCurrentlyBeingPlayed())
	{
		return {
	        totalUsers 		: Object.keys(this.users).length,
	        totalBids 		: placedBids.length,
	        longestBid 		: this.getLongestBid(),
	        activePlayers 	: this.getActiveUsers().length,
	        remainingPlayers: this.getInActiveUsers().length,
	        averageBidBank 	: this.getAverageBidBank(),
	        currentBidUser 	: {
	        	name: this.lastBidUser.getMetaData().name
	        }
	    } 
	}

	return {};    
}

Jackpot.prototype.addUser = function(userId, callback)
{
	var context = this;

    if(this.users.hasOwnProperty(userId))
    {
    	callback.call(global, null, this.users[userId]);
    }

    UserModel.find({
    	where: {id: userId},
    	raw: true
    })
    .then(function(user)
    {
    	context.users[userId] = new User(user);
    	callback.call(global, null, context.users[userId]);
    })
    .catch(function(err)
    {
    	callback.call(global, err);
    });
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

    return {
    	hours: hours,
    	minutes: minutes,
    	seconds: remainingSeconds
    };
}

Jackpot.prototype.updateLastBidDuration = function(newBid, newBidUser)
{
	var lastBid = this.lastBid;

	if(lastBid)
	{
		lastBid.updateDuration();
	}

	this.lastBid 		= newBid;
	this.lastBidUser 	= newBidUser;
}

Jackpot.prototype.increaseGameClockOnNewBid = function()
{
	this.metaData.gameClockRemaining += 10;
}

Jackpot.prototype.getActiveUsers = function()
{
	var context = this;

	return Object.keys(this.users).filter(function(id)
	{
		return context.users[id].isActive == true;
	});
}

Jackpot.prototype.getInActiveUsers = function()
{
	var context = this;

	return Object.keys(this.users).filter(function(id)
	{
		return context.users[id].isActive != true;
	});
}

Jackpot.prototype.getAverageBidBank = function()
{
	var totalAvailableBids = 0;
	var context = this;

	Object.keys(this.users).map(function(id)
	{
		totalAvailableBids += context.users[id].availableBids;
	});

	return Math.round(totalAvailableBids/Object.keys(this.users).length);
}

Jackpot.prototype.getAllBids = function()
{
	var placedBids 	= [],
		userKeys 	= Object.keys(this.users),
		usersLength = userKeys.length,
		userId,
		user;

	if(usersLength > 0)
	{
		for(var i = 0; i < usersLength; i++)
		{
			userId 		= userKeys[i];
			user 		= this.users[userId];
			placedBids.push(user.placedBids);
		}

		placedBids = [].concat.apply([], placedBids);
	}

	return placedBids;
}

Jackpot.prototype.getLongestBid = function()
{
	var bids = this.getAllBids();

	if(bids.length > 1)
	{
		bids = bids.sort(function(a, b)
		{
		    return (b.duration != null) ? b.duration - a.duration : 1;
		});
	}

	return bids[0];
}

export default Jackpot;