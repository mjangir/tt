'use strict';

import Bid from './bid';

function User(data)
{
	this.metaData 		= data;
	this.gameStatus 	= 'JOINED';
	this.isActive 		= true;
	this.availableBids 	= 10;
	this.placedBids 	= [];
}

User.prototype.placeNewBid = function()
{
	var bid = new Bid();

	this.placedBids.push(bid);

	// Decrease available bid count
	this.availableBids -= 1;

	return bid;
}

User.prototype.getMetaData = function()
{
	return this.metaData;
}
export default User;