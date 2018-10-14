var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log('Hello world');
const servers = [
    {
        type: 'minecraftping',
        host: ['minecraft.srv.npf.dk'],
        port: '25566',
        statsId: null
    },
    {
        type: 'csgo',
        host: ['casual-dust2-1.default.svc.npf.dk'],
        port: '27015'
        // casual
        //steam://connect/casual-dust2-1.default.svc.npf.dk
        //steam://connect/casual-dust2-2.default.svc.npf.dk
        //steam://connect/casual-mirage-1.default.svc.npf.dk
        //steam://connect/casual-mirage-2.default.svc.npf.dk
        //steam://connect/casual-cash-1.default.svc.npf.dk
        //steam://connect/casual-cash-2.default.svc.npf.dk
        //steam://connect/casual-inferno-1.default.svc.npf.dk
        //steam://connect/casual-inferno-2.default.svc.npf.dk
        // armsrace
        //steam://connect/armsrace-dust2-1.default.svc.npf.dk
        //steam://connect/armsrace-mirage-1.default.svc.npf.dk
        //steam://connect/armsrace-cash-1.default.svc.npf.dk
        //steam://connect/armsrace-inferno-1.default.svc.npf.dk
    },
    {
        type: 'openttd',
        host: ['openttd.default.svc.npf.dk'],
        port: '3979'
    }
    // appears to not work
    //,{
    //    type: 'soldat',
    //    host: ['soldat-ctf-1.default.svc.npf.dk', 'soldat-ctf-2.default.svc.npf.dk', 'soldat-deathmatch-1.default.svc.npf.dk'],
    //    port: "13073",
    //    //port_query: 13073 + 123 + ""
    //}
    //factorio.default.svc.npf.dk can't
];
const Gamedig = require('gamedig');
Gamedig.query({
    type: 'csgo',
    host: '10.100.4.146',
    port: '27016',
}).then((state) => {
    console.log(state);
    return state;
}).catch((error) => {
    return error;
});
//protocol-ase
//protocol-battlefield
//protocol-doom3
//protocol-gamespy1
//protocol-gamespy2
//protocol-gamespy3
//protocol-nadeo
//protocol-quake2
//protocol-quake3
//protocol-unreal2
//protocol-valve
const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = {
    host: process.env.HOST,
    authKey: process.env.AUTH_KEY,
    databaseId: "FFA-QUERY",
    containerId: "Servers",
};
const cosmosClient = new CosmosClient({
    endpoint: config.host,
    auth: {
        masterKey: config.authKey
    }
});
const debug = require("debug")("stuff");
let magic = () => __awaiter(this, void 0, void 0, function* () {
    debug("Setting up the database...");
    const dbResponse = yield cosmosClient.databases.createIfNotExists({
        id: config.databaseId
    });
    let database = dbResponse.database;
    debug("Setting up the database...done!");
    debug("Setting up the container...");
    const coResponse = yield database.containers.createIfNotExists({
        id: config.containerId
    });
    let container = coResponse.container;
    // Query documents and attach existing data to them
    const querySpec = {
        query: "SELECT * FROM root r"
    };
    const { result: results } = yield container.items
        .query(querySpec)
        .toArray();
    let promises = servers.map(server => {
        let stats = results.find((stats) => { return stats.query.host == server.host[0]; });
        server.statsId = stats.id;
        console.log(`query ${server.host[0]}:${server.port}`);
        return Gamedig.query({
            type: server.type,
            host: server.host[0],
            port: server.port,
        }).then((state) => {
            //console.log(state);
            return { server, state };
        }).catch((error) => {
            console.log(`error ${server.host[0]}:${server.port}`);
            return { error, host: server.host[0] };
        });
    });
    yield Promise.all(promises).then((results) => __awaiter(this, void 0, void 0, function* () {
        // Persist document for each server
        //console.log(results);
        yield results.map(({ server, state }) => __awaiter(this, void 0, void 0, function* () {
            state.lastUpdate = new Date();
            if (server.statsId) {
                state.id = server.statsId;
                const { body: replaced } = yield container.item(server.statsId).replace(state).catch((error) => {
                    console.log(error);
                });
                console.log('replaced');
            }
            else {
                const { body: doc } = yield container.items.create(state).catch((error) => {
                    console.log(error);
                });
                console.log('create');
            }
        }));
        //item.date = Date.now();
        //item.completed = false;
        //const { body: doc } = await this.container.items.create(item);
        //return doc;
        //debug("Getting an item from the database");
        //const { body } = await this.container.item(itemId).read();
        //return body;
        //debug("Update an item in the database");
        //const doc = await this.getItem(itemId);
        //doc.completed = true;
        //const { body: replaced } = await this.container.item(itemId).replace(doc);
        //return replaced;
    })).catch((error) => {
        console.log(error);
    });
    //const querySpec = {
    //    query: "SELECT * FROM root r WHERE r.completed=@completed",
    //    parameters: [
    //        {
    //            name: "@completed",
    //            value: false
    //        }
    //    ]
    //};
    //const { result: results } = await this.container.items
    //    .query(querySpec)
    //    .toArray();
});
magic();
//# sourceMappingURL=app.js.map