'use strict';

import Bid from './bid';
import moment from 'moment';

/**
 * Constructor
 *
 * @param {Object} data
 */
function User(data)
{
	var defAvailableBids = 10;

	if(global.globalSettings['jackpot_setting_default_bid_per_user_per_game']) 
    {
        defAvailableBids = parseInt(global.globalSettings['jackpot_setting_default_bid_per_user_per_game'], 10);
    }

	this.metaData 			= data;
	this.gameStatus 		= 'JOINED';
	this.isActive 			= true;
	this.availableBids 		= defAvailableBids;
	this.placedBids 		= [];
	this.lastBid 			= null;
	this.firstBidStartTime 	= null;
	this.lastBidStartTime 	= null;
}

/**
 * Place a new bid
 *
 * @return {Bid}
 */
User.prototype.placeNewBid = function()
{
	var bid = new Bid(this);

	this.placedBids.push(bid);

	// Set last bid
	this.lastBid = bid;

	// Decrease available bid count
	this.availableBids -= 1;

	if(this.firstBidStartTime == null)
	{
		this.firstBidStartTime = new Date();
	}

	this.lastBidStartTime = new Date();

	return bid;
}

/**
 * Get user meta data
 *
 * @return {Object}
 */
User.prototype.getMetaData = function()
{
	return this.metaData;
}

/**
 * Get my longest bid
 *
 * @return {Bid}
 */
User.prototype.getMyLongestBid = function()
{
	var bids = this.getMyBids(),
        longest;

    if(bids.length <= 0)
    {
    	return null;
    }
    else if(bids.length == 1)
    {
    	return bids[0];
    }

	longest = bids.reduce(function(l, e)
    {
      return e.duration > l.duration ? e : l;
    });

    return longest;
}

/**
 * Get my longest bid duration
 * TODO - implement human readable flag
 *
 * @param  {Boolean} humanReadable
 * @return {Integer}
 */
User.prototype.getMyLongestBidDuration = function(humanReadable)
{
	var longestBid 	= this.getMyLongestBid(),
		duration 	= null;

	// If user placed no bid
	if(longestBid == null)
	{
		return null;
	}

	// If his longest bid duration is null, then this is currently leading bid
	if(longestBid.duration == null)
	{
		duration = longestBid.getRealTimeDuration();
	}
	else
	{
		duration = longestBid.duration;
	}

	return duration;
}

/**
 * Get My Bids
 *
 * @param {Boolean} raw
 * @return {Array}
 */
User.prototype.getMyBids = function(raw)
{
	var bids = [];

	if(typeof raw == 'undefined')
	{
		return this.placedBids;
	}

	if(typeof raw != 'undefined' && raw == true)
	{
		for(var i = 0; i < this.placedBids.length; i++)
		{
			bids.push({
				startTime: moment(this.placedBids[i].startTime).format("YYYY-MM-DD HH:mm:ss"),
				endTime : this.placedBids[i].endTime != null ? moment(this.placedBids[i].endTime).format("YYYY-MM-DD HH:mm:ss") : null,
				duration: this.placedBids[i].duration
			})
		}

		return bids;
	}

	return [];
}

// Export User
export default User;