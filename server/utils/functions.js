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
