

module["exports"].requiredFields = function (request_body, fields) {
    let message = '';
    fields.forEach(key => {
        if (!request_body[key]) {
            message += key + ' is required field. '
        }
    });

    return { success: message === '', message };
}


module["exports"].numberFields = function (request_body, fields) {
    let message = '';
    fields.forEach(key => {
        if (isNaN(request_body[key])) {
            message += key + ' is NaN. '
        }
    });

    return { success: message === '', message };
}

module["exports"].numberList = function (list, fieldName) {
    let message = '';
    list.forEach((item, index) => {
        if (isNaN(item[fieldName])) {
            message += `item with index "${index}" is NaN. `
        }
    });

    return { success: message === '', message };
}


module["exports"].requredFieldList = function (list, fieldName) {
    let message = '';
    list.forEach((item, index) => {
        if (!item[fieldName]) {
            message += `${fieldName} (at ${index}) is undefined or null. `;
        }
    });

    return { success: message === '', message };
}

