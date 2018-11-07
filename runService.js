const Instagram = require('instagram-web-api');
//const configure = require('./users.json');
//const MongoClient = require('mongodb').MongoClient;
const Asyncmongodb = require('./mong');
// Connection URL
const URL = 'mongodb://localhost:27017';
// Database Name
const DB_NAME = 'henst';
const COLLECTION = 'login';
const util = require('util');


module.exports = async function() {
    const amng = new Asyncmongodb({ dbName: DB_NAME, uri: URL });
    
    async function updateAdded(followersToAdd, username = 'blower1223', db = amng) {
        const lel = await db.find({ collection: COLLECTION, where: { username: username } });
        const all = await lel[0].followersAdded + followersToAdd;
        await amng.update({
            collection: COLLECTION,
            where: { username: username },
            row: { followersAdded: all }
        })
    }
    
    async function resetAdded(username = 'blower1223', db = amng) {
        const zero = 0;
        await amng.update({
            collection: COLLECTION,
            where: { username: username },
            row: { followersAdded: zero }
        })
    }

    function promisifiedDelay(delay) {
        return new Promise(function (fulfill) {
            setTimeout(fulfill, delay)
        })
    }

    await amng.connect();
    const loginInfo = await amng.find({ collection: COLLECTION }, {});
    console.log(loginInfo);
    let temp = [];
    loginInfo.map((user) => {
        temp.push(new Instagram({ username: user.username, password: user.password }))
    });
    const users = temp;
    temp = [];

    await resetAdded();

    while (true) {
        await promisifiedDelay(3000);
        users.map(async(client) => {
            await client.login();
            const requests = await client.getFollowRequests();
            console.log(requests);
            await updateAdded(requests.length, await client.getCurUsername());
            requests.map(async(request) => {
                await client.approve({ userId: request.node.id });
            })
        });
    }
    amng.disconnect();
};

