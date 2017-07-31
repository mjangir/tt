import sqldb from '../../../sqldb';
import LevelGameUser from './level-game-user';
import {generateRandomString} from '../../../utils/functions';
import url from 'url';
import config from '../../../config/environment';
import {
    EVT_EMIT_UPDATE_NORMAL_BATTLE_LEVEL_DATA,
    EVT_EMIT_NORMAL_BATTLE_LEVEL_TIMER,
    EVT_EMIT_NORMAL_BATTLE_GAME_STARTED
} from '../../events/battle/constants';

const UserModel     = sqldb.User;
const avatarUrl     = url.format({
    protocol:   config.protocol,
    hostname:   config.ip,
    port:       config.port,
    pathname:   'images/avatar.jpg',
});

function LevelGame(level)
{
    this.level          = level;
    this.duration       = parseInt(level.metaData.duration, 10);
    this.status         = 'NOT_STARTED';
    this.gameId         = generateRandomString(20, 'aA');
    this.users          = [];
    this.bids           = [];
    this.lastBid        = null;

    this.setRoomName();
}

LevelGame.prototype.isRunning = function()
{

    return this.status == 'STARTED';
}

LevelGame.prototype.isFinished = function()
{

    return this.status == 'FINISHED';
}

LevelGame.prototype.isNotStarted = function()
{

    return this.status == 'NOT_STARTED';
}

LevelGame.prototype.countDown = function()
{
    if(this.duration  > 0)
    {
        this.duration -= 1;
    }
}

LevelGame.prototype.setRoomName = function()
{
    var roomPrefix  = 'JACKPOT_NORMAL_BATTLE_LEVEL_ROOM_';
    var uniqueId    = this.gameId;
    var roomName    = roomPrefix + uniqueId;
    this.roomName   = roomName;
}

LevelGame.prototype.getRoomName = function()
{

    return this.roomName;
}

LevelGame.prototype.getHumanDuration = function()
{
    var time = this.convertSecondsToCounterTime(this.duration);
    return time.minutes + ":" + time.seconds;
}

LevelGame.prototype.hasUser = function(jackpotUser)
{

    return this.getUser(jackpotUser) !== false ? true : false;
}

LevelGame.prototype.getUser = function(jackpotUser)
{
    var levelGameUser;

    for(var k in this.users)
    {
        levelGameUser = this.users[k];

        if(levelGameUser.jackpotUser.metaData.id == jackpotUser.metaData.id)
        {
            return levelGameUser;
        }
    }

    return false;
}

LevelGame.prototype.addUser = function(jackpotUser)
{
    var userExist   = this.getUser(jackpotUser),
        newUser     = null,
        requiredUsersToPlay;

    requiredUsersToPlay = this.level.metaData.minPlayersRequiredToStart;

    if(!userExist)
    {
        newUser = new LevelGameUser(this, jackpotUser);
        this.users.push(newUser);
    }

    if(this.users.length == requiredUsersToPlay)
    {
        this.startGame();
    }

    return this;
}

LevelGame.prototype.startGame = function()
{
    this.status = 'STARTED';

    global.jackpotSocketNamespace.in(this.getRoomName()).emit(EVT_EMIT_NORMAL_BATTLE_GAME_STARTED, {status: true});
}

LevelGame.prototype.getAllUsers = function()
{

    return this.users;
}

LevelGame.prototype.getAllActiveUsersInfo = function()
{
    var users = [],
        user;

    if(this.users.length > 0)
    {
        for(var i in this.users)
        {
            user = this.users[i];
            users.push({
                userId:     user.jackpotUser.metaData.id,
                name:       user.jackpotUser.metaData.name,
                totalBids:  user.bids.length,
                picture:    avatarUrl,
            })
        }
    }

    return users;
}

LevelGame.prototype.getLastBidUser = function()
{

    return this.getLastBid() == null ? null : this.getLastBid().user;
}

LevelGame.prototype.getLongestBidUser = function()
{

    return this.getLongestBid() == null ? null : this.getLongestBid().user;
}

LevelGame.prototype.getLastBid = function()
{

    return this.lastBid;
}

LevelGame.prototype.getAllBids = function()
{

    return this.bids;
}

LevelGame.prototype.getLongestBid = function()
{
    var bids       = this.getAllBids(),
        lastBid    = this.lastBid,
        longestBid;

    if(bids.length <= 0)
    {
        return null;
    }
    else if(bids.length == 1)
    {
        return bids[0];
    }

    longestBid = bids.reduce(function(l, e)
    {
      return e.duration > l.duration ? e : l;
    });

    if(lastBid != null && longestBid.duration > lastBid.getRealTimeDuration())
    {
        return longestBid;
    }
    else
    {
        return lastBid;
    }
}

LevelGame.prototype.getLongestBidDuration = function(humanReadable, excludeLast)
{
    if(this.lastBid == null)
    {
        return false;
    }

    var longestBid  = this.getLongestBid(),
        lastBid     = this.lastBid,
        lastBidRTD  = lastBid.getRealTimeDuration(),
        duration,
        time;

    if(longestBid.duration > lastBidRTD)
    {
        duration = longestBid.duration;
    }
    else
    {
        duration = lastBidRTD;
    }

    // If exclude last, then ignore last bid
    if(excludeLast)
    {
        duration = longestBid.duration;
    }

    // Send in human readable
    if(typeof humanReadable != 'undefined' && humanReadable == true)
    {
        time = this.convertSecondsToCounterTime(duration);
        return time.minutes + ':' + time.seconds;
    }

    return duration;
}

LevelGame.prototype.getHumanLastBidDuration = function()
{
    var time = this.getLastBid() != null ? this.convertSecondsToCounterTime(this.getLastBid().getRealTimeDuration()) : null;

    if(time !== null)
    {
        return time.minutes + ":" + time.seconds;
    }

    return null;
}

LevelGame.prototype.getHumanLongestBidDuration = function()
{
    var time = this.getLongestBid() != null ? this.convertSecondsToCounterTime(this.getLongestBid().getRealTimeDuration()) : null;

    if(time !== null)
    {
        return time.minutes + ":" + time.seconds;
    }

    return null;
}

LevelGame.prototype.convertSecondsToCounterTime = function(seconds)
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
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: remainingSeconds
    };
}

LevelGame.prototype.emitUpdatesToItsRoom = function(excludeSocket)
{
    var roomName = this.getRoomName();

    if(typeof excludeSocket != 'undefined')
    {
        excludeSocket.broadcast.in(roomName).emit(EVT_EMIT_UPDATE_NORMAL_BATTLE_LEVEL_DATA, this.getDetailedInfoForUI());
    }
    else
    {
        global.jackpotSocketNamespace.in(roomName).emit(EVT_EMIT_UPDATE_NORMAL_BATTLE_LEVEL_DATA, this.getDetailedInfoForUI());
    }
}

LevelGame.prototype.updateTimer = function()
{
    if(this.duration == 0 && this.status == 'STARTED')
    {
        this.finishGame();
        return;
    }

    if(this.status == 'STARTED')
    {
        this.countDown();
    }

    var roomName            = this.getRoomName(),
        durationTime        = this.getHumanDuration(),
        lastBidDuration     = this.getHumanLastBidDuration(),
        longestBidDuration  = this.getHumanLongestBidDuration(),
        lastBidUserName     = null,
        longestBidUserName  = null;

    if(this.getLongestBid() || this.getLastBid())
    {
        longestBidUserName = this.getLongestBid() == null ? this.getLastBid().user.jackpotUser.metaData.name : this.getLongestBid().user.jackpotUser.metaData.name;
    }

    if(this.getLastBid() != null)
    {
        lastBidUserName = this.getLastBid().user.jackpotUser.metaData.name;
    }

    // Emit the updated battle timer to everybody in its room
    global.jackpotSocketNamespace.in(roomName).emit(EVT_EMIT_NORMAL_BATTLE_LEVEL_TIMER, {
        battleClock         : durationTime,
        currentBidDuration  : lastBidDuration,
        currentBidUser      : lastBidUserName,
        longestBidDuration  : longestBidDuration,
        longestBidUserName  : longestBidUserName
    });
}

LevelGame.prototype.finishGame = function()
{

}

LevelGame.prototype.getDetailedInfoForUI = function()
{
    var users           = this.getAllUsers(),
        normalizedUsers = [],
        user,
        jackpotUser,
        userBids,
        response;

    if(users.length > 0)
    {
        for(var k in users)
        {
            user        = users[k];
            jackpotUser = user.jackpotUser;
            userBids    = user.getMyAllBids();
            normalizedUsers.push({
                id:         jackpotUser.metaData.id,
                name:       jackpotUser.metaData.name,
                //picture:    jackpotUser.metaData.photo,
                picture:    avatarUrl,
                totalBids:  userBids.length
            })
        }
    }

    response = {
        users               : normalizedUsers,
        currentBidUser      : this.getLastBidUser() == null ? null : this.getLastBidUser().jackpotUser.metaData,
        currentBidDuration  : this.getLastBid() == null ? null : this.getLastBid().duration,
        longestBidDuration  : this.getLongestBid() == null ? null : this.getLongestBid().duration,
        longestBidUser      : this.getLongestBidUser() == null ? null : this.getLongestBidUser().jackpotUser.metaData
    }

    return response;
}

export default LevelGame;