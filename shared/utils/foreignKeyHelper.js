const mongoose = require('mongoose');


module["exports"].check = function (model, id, nullable = false) {
  return new Promise((resolve, reject) => {
      if(!!nullable && id === null) return resolve(true);

      model.findOne({_id: id}, (error, result) => {
          if(result) {
              return resolve(true);
          }
          else return reject(new Error(`FK constraint 'checkObjectExists' for '${id} failed`));
      })
  })
};


module["exports"].distributor = function (id) {
    const model = mongoose.model('admins');

    return new Promise((resolve, reject) => {
        model.findOne({_id: id, is_main: true}, (error, result) => {
            if(result) {
                return resolve(true);
            }
            else return reject(new Error(`FK constraint 'checkObjectExists' for '${id} failed`));
        })
    })
};


module["exports"].nullableRoute = function (_id, ) {
    const model = mongoose.model('routes');

    return new Promise((resolve, reject) => {
        if(_id === null) return resolve(true);


        model.findOne({_id}, (error, route) => {
            if(route) {
                return resolve(true);
            }
            else return reject(new Error(`FK constraint 'checkObjectExists' for '${_id} failed`));
        })
    })
};




