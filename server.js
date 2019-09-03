const express = require('express');
var app = express();
const path = require('path');

const fs = require('fs');

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', express.static(path.join(__dirname, 'Frontend')));

var port = process.env.PORT || 3000;

//CHAT
let online_user_data = {};

group_maker = function (g) {
  let members = {};
  for (let mem in online_user_data)
    if (online_user_data[mem].group == g)
      members[mem] = online_user_data[mem];
  return members;
}

is_reg = function (user, pass) {
  return true;
}

//one instance for each user
io.on('connection', (socket) => {
  socket.emit('connected');

  //login
  socket.on('login', (data) => {

    //reading JSON database
    let rawdata = fs.readFileSync('database.json');
    let allusers = JSON.parse(rawdata);

    let access = false;
    if (online_user_data[data.user] != null) {
      io.to(socket.id).emit('alert', 'User already logged in');
    }
    else if (allusers[data.user].pass === data.pass) {
      access = true;
      io.to(socket.id).emit('access', { user: data.user, pass: data.pass, ava: allusers[data.user].ava, status: data.status, group: allusers[data.user].group });
    }
    else
      io.to(socket.id).emit('alert', 'Invalid username or password');



    if (access) {
      online_user_data[data.user] = { id: socket.id, status: data.status, group: allusers[data.user].group, ava: allusers[data.user].ava };
    }

  })
  //status change
  socket.on('status-change', (data) => {
    online_user_data[data.user].status = data.status;

    io.to(socket.id).emit('status-update', online_user_data[data.user].status);

  })

  //group-change
  socket.on('group-enter', (data) => {
    let rawdata = fs.readFileSync('database.json');
    let allusers = JSON.parse(rawdata);
    allusers[data.user].group = data.group;
    let str = JSON.stringify(allusers);
    fs.writeFileSync('database.json', str);

    online_user_data[data.user].group = data.group;
    io.to(socket.id).emit('group-update', data.group);
  })
  socket.on('group-leave', (data) => {
    let rawdata = fs.readFileSync('database.json');
    let allusers = JSON.parse(rawdata);
    allusers[data.user].group = "";
    let str = JSON.stringify(allusers);
    fs.writeFileSync('database.json', str);

    online_user_data[data.user].group = "";
    io.to(socket.id).emit('group-update', "");
  })

  //send message
  socket.on('send_msg', (data) => {
    if (data.to == "") {
      io.emit('global', { user: data.user, ava: online_user_data[data.user].ava, text: data.text, group: online_user_data[data.user].group });
    }
    else if (data.to == "@g") {
      if (data.group == "")
        io.to(socket.id).emit('notify', "You are not in a group");
      else {
        for (let member in online_user_data) {
          if (online_user_data[member].group == data.group)
            io.to(online_user_data[member].id).emit('@g', { user: data.user, ava: online_user_data[data.user].ava, text: data.text, group: online_user_data[data.user].group });
        }
      }
    }
    else if (online_user_data[data.to] != null) {
      io.to(online_user_data[data.to].id).emit('w_recv', { user: data.user, ava: online_user_data[data.user].ava, text: data.text, group: online_user_data[data.user].group });
      io.to(socket.id).emit('w_send', { user: data.user, ava: online_user_data[data.user].ava, text: data.text, recv: data.to, group: online_user_data[data.user].group });
    }
    else
      io.to(socket.id).emit('notify', "Invalid username");


    /*
    // if we use io.emit, everyone gets it
    // if we use socket.broadcast.emit, only others get it
    if (data.message.startsWith('@')) {
      //data.message = "@a: hello"
      // split at :, then remove @ from beginning
      let recipient = data.message.split(':')[0].substr(1)
      let rcptSocket = online_user_data[recipient]
      io.to(rcptSocket).emit('recv_msg', data)
    } else {
      socket.broadcast.emit('recv_msg', data)
    }*/
  })


  //user search
  socket.on('user-search', function (data) {
    if (online_user_data[data] == null) {
      io.to(socket.id).emit('notify', "Invalid username or user not online");
    }
    else
      io.to(socket.id).emit('user-search-res', { user: data, status: online_user_data[data].status, group: online_user_data[data].group, ava: online_user_data[data].ava })
  })
  //list update
  socket.on('list-update', (g) => {
    let members = group_maker(g);
    for (var m in members)
      io.to(members[m].id).emit('list-update-res', members);
  })

  //disconnect
  socket.on('disconnect', function () {
    let g = "";
    for (let del_user in online_user_data) {
      if (online_user_data[del_user].id == socket.id) {
        g = online_user_data[del_user].group;
        delete online_user_data[del_user];
      }
    }
    if (g != "") {
      let members = group_maker(g);
      for (var m in members)
        io.to(members[m].id).emit('list-update-res', members);
    }

  });

  //Register
  socket.on('register', (data) => {
    let rawdata = fs.readFileSync('database.json');
    let allusers = JSON.parse(rawdata);
    if (allusers[data.user] != null)
      io.to(socket.id).emit('alert', 'Username taken');
    else {
      allusers[data.user] = { pass: data.pass, ava: data.ava, group: data.group };
      let str = JSON.stringify(allusers);
      fs.writeFileSync('database.json', str);
      io.to(socket.id).emit('alert', 'Registration Successful!');
    }
  })

  //Deactivate
  socket.on('deactivate', (data) => {
    let rawdata = fs.readFileSync('database.json');
    let allusers = JSON.parse(rawdata);
    if (allusers[data.user] == null)
      io.to(socket.id).emit('alert', 'User does not exist');
    else if (allusers[data.user].pass == data.pass) {
      delete allusers[data.user];
      let str = JSON.stringify(allusers);
      fs.writeFileSync('database.json', str);
      io.to(socket.id).emit('alert', 'Deactivation Successful');
    }
    else io.to(socket.id).emit('alert', 'Invalid Password');

  });

})

http.listen(port, function () {
  console.log('listening on *:'+port+' \nVisit: http://localhost:'+port+'/Konnect/');
});