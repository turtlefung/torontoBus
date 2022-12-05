export const getallroutes = async () => {
    const endpoint = "https://webservices.umoiq.com/service/publicXMLFeed?command=routeList&a=ttc"
    const method = "GET";
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    return fetch(endpoint, {
        method: method,
        headers: headers
    })
        .then(response => {
            if (response.status != 200) {
                return { "error": "Cannot fetch any routes" };
            }
            return response.text();
        })
        .then(jsonResponse => {
            return jsonResponse;
        })
}

export const getdirection = async (route) => {
    const endpoint = "https://webservices.umoiq.com/service/publicXMLFeed?command=routeConfig&a=ttc&r=" + route
    const method = "GET";
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    return fetch(endpoint, {
        method: method,
        headers: headers
    })
        .then(response => {
            if (response.status != 200) {
                return { "error": "Cannot fetch any directions" };
            }
            return response.text();
        })
        .then(jsonResponse => {
            return jsonResponse;
        })
}


export const getarrivaltime = async (route, tag) => {

    const endpoint = "https://retro.umoiq.com/service/publicXMLFeed?command=predictions&a=ttc&r=" + route + "&s=" + tag;
    const method = "GET";
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    return fetch(endpoint, {
        method: method,
        headers: headers
    })
        .then(response => {
            if (response.status != 200) {
                return { "error": "Cannot fetch any directions" };
            }
            return response.text();
        })
        .then(jsonResponse => {
            return jsonResponse;
        })
}
