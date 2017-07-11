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
	this.metaData 			= data;
	this.gameStatus 		= 'JOINED';
	this.isActive 			= true;
	this.availableBids 		= 10;
	this.placedBids 		= [];
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
	var bid = new Bid();

	this.placedBids.push(bid);

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

	if(longestBid != null)
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