'use strict';

import moment from 'moment';

function Bid()
{
	this.startTime 	= new Date();
	this.endTime 	= null;
	this.duration 	= null;
}

Bid.prototype.updateDuration = function()
{
	this.endTime 	= new Date();
	this.duration 	= moment(this.endTime).diff(moment(this.startTime), "seconds");
}

Bid.prototype.getRealTimeDuration = function()
{
	return moment(new Date()).diff(moment(this.startTime), "seconds");
}

export default Bid;