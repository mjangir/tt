'use strict';

import logger from '../utils/logger';
import moment from 'moment';
import sqldb from '../sqldb';

const SettingsModel             = sqldb.Settings;
const JackpotModel              = sqldb.Jackpot;
const UserModel                 = sqldb.User;
const JackpotBattleLevelModel   = sqldb.JackpotBattleLevel;

/**
 * Get All Users
 *
 * @return {Promise}
 */
function getAllUsers()
{
    return UserModel.findAll({raw: true, attributes: ['id', 'name', 'email', 'gender', 'photo']});
}

/**
 * Get All Settings
 *
 * @return {Promise}
 */
function getAllSettings()
{
    return SettingsModel.findAll({raw: true});
}

/**
 * Get All Jackpots
 *
 * @return {Promise}
 */
function getAllJackpots()
{
    return JackpotModel.findAll({
        attributes: [
            'id',
            'title',
            'amount',
            'minPlayersRequired',
            'gameClockTime',
            'doomsDayTime',
            'increaseAmountSeconds',
            'increaseAmount',
            'gameStatus',
            'uniqueId',
            'status'
        ],
        include: [ { model: JackpotBattleLevelModel, as: 'JackpotBattleLevels'} ]
    });
}

/**
 * Get Simplified Jackpots Data
 *
 * @param  {Array} jackpots
 * @return {Array}
 */
function getSimplifiedJackpots(jackpots)
{
    return jackpots.map(function(jp)
    {
        return jp.get({ plain: true });
    });
}

/**
 * Create Global Game State
 *
 * @param  {Socket.IO} socketio
 * @return {*}
 */
export default function(socketio)
{
    // Get All Settings
    return getAllSettings()
    .then(function(settings)
    {
        global.ticktockGameState.settings = settings;
        return getAllUsers();
    // Get All Users
    }).then(function(users)
    {
        global.ticktockGameState.users = users;
        return getAllJackpots();
    // Get All Jackpots
    }).then(function(jackpots)
    {
        const jackpotsPlain = getSimplifiedJackpots(jackpots);
        return new Promise(function(resolve, reject)
        {
            resolve(jackpotsPlain);
        });
    });
}