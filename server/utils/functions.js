import multer from 'multer';
import path from 'path';
import uuid from 'uuid';

export const checkNestedPropery = function(obj)
{
  var args = Array.prototype.slice.call(arguments, 1);

  for(let i = 0; i < args.length; i++)
  {
    if(!obj || !obj.hasOwnProperty(args[i]))
    {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
}

export const userAvatarMulter = function()
{
    const storage = multer.diskStorage({
      destination: function (req, file, cb)
      {
          cb(null, path.join(__dirname, '../uploads/users/' + req.user.user_id));
      },
      filename: function (req, file, cb)
      {
          cb(null, uuid.v4() + path.extname(file.originalname));
      }
    });

    return multer({
        storage: storage
    });
}