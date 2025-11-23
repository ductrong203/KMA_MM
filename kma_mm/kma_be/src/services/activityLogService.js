const  {activity_logs, users} = require("../models");
async function logActivity({username, role, action, endpoint, reqData, response_status, resData, ip, is_list }) {
    await activity_logs.create({
        Username: username,
        Role: role,
        action,
        endpoint, 
        request_data: reqData,
        response_status,
        resonse_data: resData,
        ip_address: ip,
        is_list: is_list || 0

    });
}
module.exports = {logActivity};