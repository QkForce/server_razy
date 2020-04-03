// mongodb://<dbuser>:<dbpassword>@ds111410.mlab.com:11410/fullstack
// mongodb://127.0.0.1:27017/poligon


if (process.env.NODE_ENV === 'production') {
    module["exports"] = require('./keys.prod');
} else {
    module["exports"] = require('./keys.dev');
}
