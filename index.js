const Instagram = require('instagram-web-api');
const configure = require('./users.json');



//const client = new Instagram({ username: configure.users[0].user, password: configure.users[0].password });
let temp = [];
configure.users.map((user) => {
    temp.push(new Instagram({ username: user.user, password: user.password }))
});
const users = temp;
temp = [];


async function approveAll() { //сложная конструкция да - зато шорт и безопас
    users.map(async (client) => {
        await client.login();
        let timerId = setTimeout(async function approveSession() {
            const req = await client.getFollowRequests();
            console.log(req);
            req.map(elem =>
                (async () => await client.approve({ userId: elem.node.id }))()
            );
            timerId = setTimeout(approveSession, 60000);
        }, 60000);
    })
}


approveAll();

