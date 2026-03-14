
require('dotenv').config();
const Server = require("./config/server_config")

const main=()=>{
    const server=new Server();
    server.listen()
}

main();