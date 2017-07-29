import sqldb from '../../../sqldb';
import LevelGameUser from './level-game-user';
import {generateRandomString} from '../../../utils/functions';

function LevelGame(level)
{
    this.level      = level;
    this.duration   = parseInt(level.metaData.duration, 10);
    this.status     = 'NOT_STARTED';
    this.gameId     = generateRandomString(20, 'aA');
    this.users      = [];
    this.bids       = [];
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
    return time.hours + ":" + time.minutes + ":" + time.seconds;
}

LevelGame.prototype.hasUser = function(userId)
{
    return this.getUser() !== false ? true : false;
}

LevelGame.prototype.getUser = function(userId)
{
    var user;

    for(var k in this.users)
    {
        user = this.users[k];

        if(user.metaData.id == userId)
        {
            return user;
        }
    }

    return false;
}

LevelGame.prototype.addUser = function(userId, callback)
{
    var context     = this,
        userExist   = this.getUser(),
        newUser     = null;

    if(userExist != false)
    {
        callback.call(global, null, userExist);
    }
    else
    {
        UserModel.find({
            where: {id: userId},
            raw: true
        })
        .then(function(user)
        {
            newUser = new LevelGameUser(user);
            context.push(newUser);
            callback.call(global, null, newUser);
        })
        .catch(function(err)
        {
            callback.call(global, err);
        });
    }
}

export default LevelGame;