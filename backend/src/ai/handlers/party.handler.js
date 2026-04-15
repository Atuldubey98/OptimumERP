const partyService = require("../../services/party.service");
const partyHandler = {
    create_party: (params) => {
        return partyService.create(params);
    },
    get_party: (params) => {        
        return partyService.findByName(params?.name, params.org);
    }
}
module.exports = partyHandler;