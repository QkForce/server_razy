const Distributor = require('../../models/Distributor');
const DistributorOwner = require('../../models/DistributorOwner');
const Courier = require('../../models/Courier');
const Client = require('../../models/Client');
const errorHandler = require('../../shared/utils/errorHandler');
const tokenGenerator = require('../../shared/utils/tokenGenerator');

const WRONG_IDENTIFICATION_DATA = {
    success: false,
    message: 'Пожалуйста, проверьте правильность написания email и пароля.'
};

const DUPLICATE_EMAIL = {
    success: false,
    message: 'Такой email уже занят. Побробуй другой.'
};

const SUCCESS_LOGIN = 'Authentication was successfully.';

const USER_TYPES = {
    admin: 'admin',
    distributor_owner: 'distributor_owner',
    distributor: 'distributor',
    courier: 'courier',
    client: 'client'
};

const COLLECTIONS = new Map([
    ['admin', DistributorOwner],
    ['distributor_owner', DistributorOwner],
    ['distributor', Distributor],
    ['courier', Courier],
    ['client', Client]
]);





//************************************ LOGIN ******************************************

async function login(user, userType, response) {
    if (!user) {
        //Пользователь нет, ошибка
        return response.status(404).json(WRONG_IDENTIFICATION_DATA);
    }
    //Проверка пароля, пользователь существует
    const token = tokenGenerator(user._id, user.email, userType);
    user.tokens = user.tokens.concat({token});
    await user.save();

    response.status(200).json({
        success: true,
        message: SUCCESS_LOGIN,
        token: `Bearer_${token}`
    });
}


module["exports"].loginAdmin = async function (request, response) {
    try {
        const admin = await DistributorOwner.findByCredentials(request.body.email, request.body.password, true);
        await login(admin, USER_TYPES.admin, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].loginDistributorOwner = async function (request, response) {
    try {
        const distributor_owner = await DistributorOwner.findByCredentials(request.body.email, request.body.password, false);        
        await login(distributor_owner, USER_TYPES.distributor_owner, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].loginDistributor = async function (request, response) {
    try {
        const distributor = await Distributor.findByCredentials(request.body.email, request.body.password);
        await login(distributor, USER_TYPES.distributor, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].loginCourier = async function (request, response) {
    try {
        const courier = await Courier.findByCredentials(request.body.email, request.body.password);
        await login(courier, USER_TYPES.courier, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].loginClient = async function (request, response) {
    try {
        const client = await Client.findByCredentials(request.body.email, request.body.password);
        await login(client, USER_TYPES.client, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};





//************************************ LOGOUT ******************************************
async function logout(user, _token, response) {
    // Log user out of the application
    if (!user) {
        response.status(401).json({success: false, message: 'Invalid login credentials'});
        return;
    }
    user.tokens = user.tokens.filter((token) => {
        return token["token"] !== _token;
    });
    await user.save();
    response.status(200).json({
        success: true,
        message: 'Logout was successfully'
    });
}


module["exports"].logoutAdmin = async function (request, response) {
    // Log user out of the application
    try {
        await logout(request.admin, request.token, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].logoutDistributorOwner = async function (request, response) {
    // Log user out of the application
    try {
        await logout(request.distributor_owner, request.token, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].logoutDistributor = async function (request, response) {
    // Log user out of the application
    try {
        await logout(request.distributor, request.token, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].logoutCourier = async function (request, response) {
    // Log user out of the application
    try {
        await logout(request.courier, request.token, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].logoutClient = async function (request, response) {
    // Log user out of the application
    try {
        await logout(request.client, request.token, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};





//************************************ LOGOUT ALL ******************************************
async function logoutAll(user, response) {
    if (!user) {
        response.status(401).json({success: false, message: 'Invalid login credentials'});
        return;
    }
    user.tokens.splice(0, user.tokens.length);
    await user.save();

    response.status(200).json({
        success: true,
        message: 'LogoutAll was successfully'
    });
}


module["exports"].logoutAllAdmin = async function (request, response) {
    try {
        await logoutAll(request.admin, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].logoutAllDistributorOwner = async function (request, response) {
    try {
        await logoutAll(request.distributor_owner, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].logoutAllDistributor = async function (request, response) {
    try {
        await logoutAll(request.distributor, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].logoutAllCourier = async function (request, response) {
    try {
        await logoutAll(request.courier, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};


module["exports"].logoutAllClient = async function (request, response) {
    try {
        await logoutAll(request.client, response);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};







