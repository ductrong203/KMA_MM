const  {activity_logs, users} = require("../models");
async function logActivity({username, role, action, endpoint, reqData, response_status, resData, ip }) {
    await activity_logs.create({
        Username: username,
        Role: role,
        action,
        endpoint, 
        request_data: reqData,
        response_status,
        resonse_data: resData,
        ip_address: ip,

    });
}
module.exports = {logActivity};