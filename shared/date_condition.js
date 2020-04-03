const moment = require('moment');


module["exports"].forDay = function (query_day) {
    console.log(new Date('12/03/2020'))
    let day = new Date(query_day);
    return {
        $gte: moment(day, 'YYYY-MM-DD').startOf('day').toDate(),
        $lte: moment(day, 'YYYY-MM-DD').endOf('day').toDate()
    };
}


module["exports"].forMonth = function (query_month) {
    let month = new Date(query_month);
    return {
        $gte: moment(month, 'YYYY-MM-DD').startOf('month').toDate(),
        $lte: moment(month, 'YYYY-MM-DD').endOf('month').toDate()
    };
}


module["exports"].forPeriod = function (query_start, query_end) {
    let start = new Date(query_start);
    let end = new Date(query_end);
    start = moment(start, 'YYYY-MM-DD').startOf('day').toDate();
    end = moment(end, 'YYYY-MM-DD').startOf('day').toDate();
    return { $gte: start, $lte: end };
}