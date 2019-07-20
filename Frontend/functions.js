notify = function (str, c = "warning") {
    $('#notify').append(`<div class="text-${c}"><small>${str}</small></div>`);
    $('#notify').scrollTop($('#notify')[0].scrollHeight);
}

chatmsg = function (name, ava, text, group = "", c = "light", s = "") {
    if(group=="")
    group="-";
    return `
    <div class="border-top text-${c}">
    <br>
    <div class="border rounded border-${c}" style="height: 50px; width: 240px">
        <div style="position:relative;top:0px; left:0px; display: inline-block">
            <img src="Avatars/${ava}.png" alt="profile" class="rounded"
                style="position:relative; top: -13px;left:-10px; width: 50px; height: 50px; padding: 5px;margin-left: 10px">
        </div>
        <div style="position:relative; display:inline-block">
            <span style="display:block;">${name}</span>
            <small>${group}</small>
        </div>
    </div>
    <div class="flex-grow-1" style="position: relative;top:-50px;left: 250px;width:1200px">
        ${s} ${text}
    </div>
</div>
    `
}

search_res = function (name, ava, status, group,c="light") {
    $('#searchresults').empty();
    $('#searchresults').append(`
    <div class="text-${c}" style="padding-top: 4px;padding-left:40px">
    <div class="border rounded border-${c}" style="height: 70px; width: 240px">
        <div style="position:relative;top:0px; left:0px; display: inline-block">
            <img src="Avatars/${ava}.png" alt="profile" class="rounded"
                style="position:relative; top: -23px;left:-10px; width: 50px; height: 50px; padding: 5px;margin-left: 10px">
        </div>
        <div style="position:relative; display:inline-block">
            <span style="display:block;">${name}</span>
            <small style="display:block;">${group}</small>
            <small>${status}</small>
        </div>
    </div>
    
</div>
    `);
}

list_add = function (name,ava,status){
    let c = "light"
    if(status == "Away")
    c="warning";
    else if (status == "Busy")
    c="danger";
    return `
    <div class="text-${c}" >
    <br>
    <div class="border rounded border-${c}" style="height: 50px; width: 240px;margin-left:40px">
        <div style="position:relative;top:0px; left:0px; display: inline-block">
            <img src="Avatars/${ava}.png" alt="profile" class="rounded"
                style="position:relative; top: -13px;left:-10px; width: 50px; height: 50px; padding: 5px;margin-left: 10px">
        </div>
        <div style="position:relative; display:inline-block">
            <span style="display:block;">${name}</span>
            <small>${status}</small>
        </div>
    </div>
</div>
    `
}