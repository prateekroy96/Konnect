var socket = io();

//let isin = false;

//
update_group = function (g) {
    if (g != "")
    socket.emit('list-update', g);
    else
    $('#m').empty();
}




$(function () {
    let user = "";
    let pass = "";
    let ava = 0;
    let status = "Online";
    let group = "";
    send_msg = function () {
        let to = $('#to').val();
        let txt = $('#txt').val();
        $('#txt').val('');
        if (to == user) {
            notify("Try not to talk to yourself");
        }
        else if (txt != "")
            socket.emit('send_msg', { to: to, text: txt, user: user, group: group });

    }

    //$('#m').hide();

    $('#room').hide();
    $('#home').show();

    $('#m1').hide();
    $('#m2').hide();
    $('#m3').hide();
    $('#m4').hide();

    //notify
    socket.on('notify', (data) => {
        notify(data);
    })

    //alert
    socket.on('alert', (data) => {
        alert(data);
    })

    //login
    login = function () {
        let unchecked_username = $("#user-log").val();
        let unchecked_password = $("#pass-log").val();
        if (unchecked_username != "" && unchecked_password != "") {

            socket.emit('login', {
                user: unchecked_username,
                pass: unchecked_password,
                status: "Online"
            })
        }
        else
            alert("No username or password");
    }
    $('#user-log').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            login();
        }
    });
    $('#pass-log').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            login();
        }
    });

    $('#log').click(login)

    socket.on("access", function (data) {
        notify("Welcome to Konnect!<br>Type username in @ textbox to wisper<br>Type @g in @ textbox to send group message<br>----------------------------------------------------------","success");

        user = data.user;
        pass = data.pass;
        ava = data.ava;
        group = data.group;

        //changing location
        $('#home').hide();
        $('#room').show();

        //setting profile
        $("#prof-img").empty();
        $("#prof-img").append($(`<img src="Avatars/${ava}.png" alt="profile" class="rounded" style="position:relative; top: 0px; width: 50px; height: 50px; padding: 5px">`));
        $("#name").empty();
        $("#name").append(user);
        $("#stat").empty();
        $("#stat").append(status);

        //setting group
        $('#g-val').empty();
        if(group!="")
        $('#g-val').append("Group: " + group);
        else
        $('#g-val').append("Group: No Group");
        update_group(group);
    })

    //status change
    $('#o').click(function () {
        if (status != "Online") {
            socket.emit('status-change', {
                user: user,
                pass: pass,
                status: "Online"
            })
        }
        else notify("Status is already online");
    })
    $('#a').click(function () {
        if (status != "Away") {
            socket.emit('status-change', {
                user: user,
                pass: pass,
                status: "Away"
            })
        }
        else notify("Status is already away");
    })
    $('#b').click(function () {
        if (status != "Busy") {
            socket.emit('status-change', {
                user: user,
                pass: pass,
                status: "Busy"
            })
        }
        else notify("Status is already busy");
    })
    socket.on('status-update', (data) => {
        status = data;
        $("#stat").empty();
        $("#stat").append(status);
        update_group(group);
    })

    //group change
    $('#g').click(function () {
        if (group == "") {
            //group = "Gliders";
            socket.emit('group-enter', {
                user: user,
                pass: pass,
                group: "Gliders"
            })
        }
        else
            notify('Already in group ' + group);
    })
    $('#h').click(function () {
        if (group == "") {
            //group = "Gliders";
            socket.emit('group-enter', {
                user: user,
                pass: pass,
                group: "Hunters"
            })
        }
        else
            notify('Already in group ' + group);
    })
    $('#t').click(function () {
        if (group == "") {
            //group = "Gliders";
            socket.emit('group-enter', {
                user: user,
                pass: pass,
                group: "Tweeters"
            })
        }
        else
            notify('Already in group ' + group);
    })
    $('#w').click(function () {
        if (group == "") {
            //group = "Gliders";
            socket.emit('group-enter', {
                user: user,
                pass: pass,
                group: "Waddlers"
            })
        }
        else
            notify('Already in group ' + group);
    })
    $('#leave').click(function () {
        if (group != "") {
            notify("Leaving group...")
            //group = "Gliders";
            socket.emit('group-leave', {
                user: user,
                pass: pass
            })
        }
        else
            notify("Currently not in any group");
    })
    socket.on("group-update", (data) => {
        if(data!="")
        notify("Group updated: " + data);
        else
        notify("Group updated: No Group");

        group = data;
        
        $('#g-val').empty();
        if(group!="")
        $('#g-val').append("Group: " + group);
        else
        $('#g-val').append("Group: No Group");
        update_group(group);
    })

    //chat
    $('#txt').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            send_msg();
        }
    });

    $('#send').click(send_msg);
    socket.on('global', (data) => {
        $('#msg').append(chatmsg(data.user, data.ava, data.text, data.group, "light", "[Global]:"));
        $('#msgbox').scrollTop($('#msgbox')[0].scrollHeight);
    })
    socket.on('@g', (data) => {
        $('#msg').append(chatmsg(data.user, data.ava, data.text, data.group, "success", "[Group]:"));
        $('#msgbox').scrollTop($('#msgbox')[0].scrollHeight);
    })
    socket.on('w_recv', (data) => {
        $('#msg').append(chatmsg(data.user, data.ava, data.text, data.group, "info", "[To you]:"));
        $('#msgbox').scrollTop($('#msgbox')[0].scrollHeight);
    })
    socket.on('w_send', (data) => {
        $('#msg').append(chatmsg(data.user, data.ava, data.text, data.group, "info", "[To " + data.recv + "]:"));
        $('#msgbox').scrollTop($('#msgbox')[0].scrollHeight);
    })


    //searching user
    search_go = function () {
        let v = $('#searchinp').val();
        if (v == "")
            notify("Enter a username!");
        else
            socket.emit('user-search', v);
        $('#searchinp').val('');
    }

    $('#searchinp').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            search_go();
        }
    });

    $('#searchbtn').click(search_go);
    socket.on('user-search-res', (data) => {
        search_res(data.user, data.ava, data.status, data.group);
    });

    //list update
    socket.on('list-update-res', (M) => {
        $('#m').empty();

        for (let m in M) {

            $('#m').append(list_add(m + "", M[m].ava, M[m].status));
        }
    })

    //logout
    $('#logout').click(function () {
        location.reload();
    });

    //Register
    register = function () {
        let r_ava = $("input[name='img']:checked").val();
        let r_user = $("#user-reg").val();
        let r_pass = $("#pass-reg").val();
        let r_pass2 = $("#pass2-reg").val();
        
        if (r_ava == undefined || r_user == undefined || r_pass == undefined || r_pass2 == undefined)
            alert("Fill all the details!");
        else if (r_user.length > 15)
            alert("Username cannot be more than 15 characters");
        else if (r_pass != r_pass2)
            alert("Passwords do not match!");
        else if (r_pass.length < 5)
            alert("Password must be at least 5 characters long");
        else
            socket.emit('register', { user: r_user, pass: r_pass, ava: r_ava, group: "" });
    }
    $('#user-reg').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            register();
        }
    });
    $('#pass-reg').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            register();
        }
    });
    $('#pass2-reg').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            register();
        }
    });
    $('#reg').click(register)

    //Deactivate
    deact = function () {
        let d_user = $('#user-de').val();
        let d_pass = $('#pass-de').val();
        if ($('#check-de').is(":checked") && d_user != undefined && d_pass != undefined) {
            socket.emit('deactivate', { user: d_user, pass: d_pass });
        }
        else
            alert("Fill all details");
    }


    $('#user-de').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            deact();
        }
    });
    $('#pass-de').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
        {
            deact();
        }
    });

    $('#de').click(deact);

})