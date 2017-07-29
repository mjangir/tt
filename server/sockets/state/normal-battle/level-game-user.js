import sqldb from '../../../sqldb';

/**
 * Constructor
 * @param {data}
 */
function LevelGameUser(data)
{
    this.metaData   = data;
    this.isActive   = true;
    this.joinedOn   = new Date();
}

export default LevelGameUser;