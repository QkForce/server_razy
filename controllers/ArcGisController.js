const errorHandler = require('../shared/utils/errorHandler');
const tools = require('../shared/tools')
const fetch = require("node-fetch");
const CLIENT_ID = 'z40cdUhLJVIuiXLA';
const CLIENT_SECRET = '74f690c7d7bc4ae3b37be0bd6c0069c6';


// token -- admin
// depots
// routes
// orders
// fake=[true, false]
module["exports"].compute = async function (request, response) {
    try {
        //=============================== Checking =======================================
        const routes = JSON.parse(request.body.routes);
        const orders = JSON.parse(request.body.orders);
        if (routes.features.length < 1) {
            return response.status(200).json({ success: false, message: 'routes.length <= 0' });
        }
        if (routes.features.length > request.distributor.trucks_count) {
            return response.status(200).json({ success: false, message: 'routes.length > trucks_count' });
        }
        if (orders.features.length < 1 || routes.features.length > orders.features.length) {
            return response.status(200).json({ success: false, message: 'Wrong orders.length' });
        }

        //=============================== GenerateToken =======================================
        if (true) {
            return response.status(200).json(fakeCompute(orders, routes));
        }



        //=============================== GenerateToken =======================================
        let token = null;
        token = await generateToken(CLIENT_ID, CLIENT_SECRET);
        //token = 'GcLdIkIPtUjM0E6ehD0whReKBfzc753M93oYtfepMEeXXGOzcj3Qn-SDVfnVI5Ak6e_K0m_DIWvHN6bpBw0H_PUzqChkYAfX9SelMIDdk0sfH74w6b2XqtIqyDWfIKP20BdVoD2-fjnFzo9uNVPi9Q..';
        console.log('token:', token);


        //=============================== SubmitJob =======================================
        let jobId = null;


        jobId = await submitJob(token, request.body.depots, request.body.routes, request.body.orders);
        //jobId = 'j2050a45e7cd748cbae6dd8f4a9606dcb';
        console.log('jobId:', jobId);

        //=============================== GetJob =======================================
        let result = {};


        for (let i = 0; i < 7; i++) {
            await tools.delay(7000);
            result = await getJob(jobId, token, CLIENT_ID);
            if (result.value) break;
        }
        console.log(!!result.value);

        response.status(200).json(result);
    } catch (e) {
        errorHandler.hand(response, e);
    }
};




function fakeCompute(orders, routes) {
    if (routes.features.length > orders.features.length) {
        throw Error("Ew ew eeeeew");
    }

    const DepotName = routes.features[0].attributes.StartDepotName;

    const data = {
        value: {
            features: []
        }
    };

    const orders_array = [];
    routes.features.forEach((f, r_index) => orders_array.push([{
        attributes: {
            Name: DepotName,
            RouteName: `Route ${r_index + 1}`,
            Sequence: 1
        }
    }]));

    for (let i = 0, r_index = 0; i < orders.features.length; i++, r_index++) {
        if (r_index === routes.features.length) r_index = 0;

        orders_array[r_index].push({
            attributes: {
                Name: orders.features[i].attributes.Name,
                RouteName: `Route ${r_index + 1}`,
                Sequence: orders_array[r_index].length + 1,
            }
        });
    }

    orders_array.forEach((r, r_index) => r.push({
        attributes: {
            Name: DepotName,
            RouteName: `Route ${r_index + 1}`,
            Sequence: r.length + 1
        }
    }));

    orders_array.forEach(r => {
        r.forEach(o => data.value.features.push(o))
    });

    return data;
}


async function generateToken(client_id, client_secret) {
    const formData = new URLSearchParams();
    formData.append("f", "json");
    formData.append("client_id", client_id);
    formData.append("client_secret", client_secret);
    formData.append("grant_type", "client_credentials");

    const generateTokenResponse = await fetch(
        "https://www.arcgis.com/sharing/rest/oauth2/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        }
    );
    const result = await generateTokenResponse.json();
    return result["access_token"];
}


async function submitJob(token, depots, routes, orders) {
    const formData = new URLSearchParams();
    formData.append("f", "json");
    formData.append("token", token);
    formData.append("populate_directions", "true");
    formData.append("depots", depots);
    formData.append("routes", routes);
    formData.append("orders", orders);
    const submitJobResponse = await fetch(
        "https://utility.arcgis.com/usrsvcs/appservices/WN13N7K90EyzUI3x/rest/services/World/VehicleRoutingProblem/GPServer/SolveVehicleRoutingProblem/submitJob",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        }
    );
    const submitJobResponseJson = await submitJobResponse.json();
    return submitJobResponseJson["jobId"];
}


async function getJob(jobId, token, client_id) {
    const formData = new URLSearchParams();
    formData.append("f", "json");
    formData.append("token", token);

    const getJobResponse = await fetch(
        `https://utility.arcgis.com/usrsvcs/appservices/WN13N7K90EyzUI3x/rest/services/World/VehicleRoutingProblem/GPServer/SolveVehicleRoutingProblem/jobs/${jobId}/results/out_stops`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        }
    );
    const result = await getJobResponse.json();
    return result;
}