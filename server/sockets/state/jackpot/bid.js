'use strict';

import moment from 'moment';

/**
 * Constructor
 *
 */
function Bid()
{
	this.startTime 	= new Date();
	this.endTime 	= null;
	this.duration 	= null;
}

/**
 * Update duration of this bid by getting difference
 *
 * @return {*}
 */
Bid.prototype.updateDuration = function()
{
	this.endTime 	= new Date();
	this.duration 	= moment(this.endTime).diff(moment(this.startTime), "seconds");
}

/**
 * Get Real time duration of bid
 * difference of start and current time
 *
 * @return {Integer}
 */
Bid.prototype.getRealTimeDuration = function()
{
	return moment(new Date()).diff(moment(this.startTime), "seconds");
}

// Export Bid
export default Bid;