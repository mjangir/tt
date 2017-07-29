import sqldb from '../../../sqldb';
import LevelGameUser from './level-game-user';
import {generateRandomString} from '../../../utils/functions';

const UserModel = sqldb.User;

/**
 * Constructor
 * @param {level}
 */
function LevelGame(level)
{
    this.level      = level;
    this.duration   = level.metaData.duration;
    this.status     = 'NOT_STARTED';
    this.gameId     = generateRandomString(20, 'aA');
    this.users      = {};
}

/**
 * Count down the timer
 *
 * @return {*}
 */
LevelGame.prototype.countDown = function()
{
    if(this.duration  > 0)
    {
        this.duration -= 1;
    }
}

/**
 * Set socket room name
 *
 */
LevelGame.prototype.setRoomName = function()
{
    var roomPrefix  = 'JACKPOT_NORMAL_BATTLE_LEVEL_ROOM_';
    var uniqueId    = this.gameId;
    var roomName    = roomPrefix + uniqueId;
    this.roomName   = roomName;
}

/**
 * Get Socket room name
 *
 * @return {String}
 */
LevelGame.prototype.getRoomName = function()
{
    return this.roomName;
}

/**
 * Get Human Readable Game Clock Time
 *
 * @return {String}
 */
LevelGame.prototype.getHumanDuration = function()
{
    var time = this.convertSecondsToCounterTime(this.duration);
    return time.hours + ":" + time.minutes + ":" + time.seconds;
}

/**
 * Check if LevelGame has user
 *
 * @param  {Integer}  userId
 * @return {Boolean}
 */
LevelGame.prototype.hasUser = function(userId)
{
    return this.users.hasOwnProperty(userId);
}

/**
 * Get LevelGame User Instance
 *
 * @param  {Integer}  userId
 * @return {JackpotUser}
 */
LevelGame.prototype.getUser = function(userId)
{
    return this.users[userId] ? this.users[userId] : false;
}

/**
 * Add a new LevelGame user
 *
 * @param {Integer}   userId
 * @param {Function} callback
 */
LevelGame.prototype.addUser = function(userId, callback)
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
        context.users[userId] = new LevelGameUser(user);
        callback.call(global, null, context.users[userId]);
    })
    .catch(function(err)
    {
        callback.call(global, err);
    });
}

LevelGame.prototype.removeUser = function(userId)
{

}

export default LevelGame;