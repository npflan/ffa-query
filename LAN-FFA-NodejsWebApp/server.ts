import http = require('http');
var port = process.env.port || 1337
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const CosmosClient = require("@azure/cosmos").CosmosClient;

    const config = {
        host: process.env.HOST,
        authKey: process.env.AUTH_KEY,
        databaseId: "FFA-QUERY",
        containerId: "Servers",
    }

    const cosmosClient = new CosmosClient({
        endpoint: config.host,
        auth: {
            masterKey: config.authKey
        }
    });

    const magic = async () => {
        //debug("Setting up the database...");
        const dbResponse = await cosmosClient.databases.createIfNotExists({
            id: config.databaseId
        });

        let database = dbResponse.database;

        //debug("Setting up the database...done!");
        //debug("Setting up the container...");
        const coResponse = await database.containers.createIfNotExists({
            id: config.containerId
        });

        let container = coResponse.container;

        // Query documents and attach existing data to them
        const querySpec = {
            query: "SELECT * FROM root r"
        };

        const { result: results } = await container.items
            .query(querySpec)
            .toArray();

        res.write('<html><body>')
        res.write(`<style>
            td {
                vertical-align: middle;
                color: white;
                border-style: none;
                border-width: 0;
            }
        </style>`)

        res.write(`<table cellpadding="10" cellspacing="0"><tbody>`);

        

        res.write(`</tbody></table>`);

        // TODO: group by game
        //<li><a href="steam://connect/casual-dust2-1.default.svc.npf.dk">Dust 2 (server 1)</a></li>
        results.map((stats) => {
            res.write(`
            <tr>
                <td><img class="aligncenter size-full wp-image-13663" src="${stats.gameImage}"></td>
                <td>${stats.raw.game||stats.query.type}</td>
                <td>Casual?</td>
                <td>
                    Join: ${stats.query.host} | ${stats.name}
                </td>
                <td>
                <a href="${stats.downloadUrl}">Download</a>
                </td>
            </tr>`);
            res.write(stats.query.host + "<br/>")
        });

        res.end("</body></html>");
    }

    magic()


}).listen(port);