// ==UserScript==
// @name          TagPro ModFather
// @description   Shows available mods on the TagPro website, Notifies when new Mods are released, And more...
// @author        Ko
// @version       0.2.beta
// @match         http://*.koalabeast.com/*
// @match         greasyfork.org/modfather
// @supportURL    https://www.reddit.com/message/compose/?to=Wilcooo
// @website       https://redd.it/no-post-yet
// @icon          https://raw.githubusercontent.com/wilcooo/TagPro-ModFather/master/icon.png
// @download      https://raw.githubusercontent.com/wilcooo/TagPro-ModFather/master/tpmf.user.js
// @license       MIT
// @grant         GM_setValue
// @grant         GM_getValue
// @grant         GM_openInTab
// @grant         GM_xmlhttpRequest
// @connect       script.google.com
// @connect       script.googleusercontent.com
// @namespace https://greasyfork.org/users/152992
// ==/UserScript==

const DATABASE_URL = "https://script.google.com/macros/s/AKfycbybe8e37-gpfe3cqN53UxZbvqVdysjFfdN5e1pDeqeJtAvnjaI/exec";


function prepareDatabase(data) {

    data.lastUpdated = Number(data.lastUpdated);

    // Add all updates to their respective mods
    for (let update of data.UPDATES) {
        update.TIMESTAMP = new Date(update.TIMESTAMP).getTime();

        for (var mod of data.MODS) if (update.MOD == mod.NAME) break;

        mod.UPDATES = (mod.UPDATES || []).concat( update );
    }

    var modID = 0;

    for (let mod of data.MODS) {
        mod.TIMESTAMP = new Date(mod.TIMESTAMP).getTime();

        mod.ID = modID++;

        // Make these comma seperated lists real lists:
        mod.AUTHORS = mod.AUTHORS.split(', ');
        mod.TAGS = mod.TAGS.split(', ');

        for (var a=0; a<mod.AUTHORS.length; a++) {
            for (var author of data.AUTHORS) if (mod.AUTHORS[a] == author.NAME) break;

            // Link authors to mods and vice versa
            mod.AUTHORS[a] = author;
            author.MODS = (author.MODS || []).concat( mod );
        }
    }

    for (let author of data.AUTHORS) author.TIMESTAMP = new Date(author.TIMESTAMP).getTime();

    return data;
}

getJSON = window.$ && $.getJSON || function(url, data, success) {


    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                console.error("Something went wrong while getting ModFather data.", xhr);
            }
        }
    };

    xhr.open("GET", url + '?' + data , true);
    xhr.send();
};


// When the database gets rehosted/changed, this should be the only function in need of an edit.
// (As long as the structure of the resolved object stays the same)

var getDatabase = new Promise(function(resolve,reject){
    try{

        // STEP 1: grab data from database

        getJSON(DATABASE_URL, "time", function(stripped) {

            try{

                if ( stripped.lastUpdated > GM_getValue("database",{lastUpdated:0}).lastUpdated ) {

                    getJSON(DATABASE_URL, "full", function(data) {

                        try {

                            GM_setValue("database",data);

                            // STEP 2: prepare the data in the right format

                            // STEP 3: resolve the promise with all the data.
                            resolve( prepareDatabase(data) );

                        } catch(e) {

                            var reason = e;
                            reject('Could not grab the data from the database because the following error occured: '+reason);
                        }

                    });
                }

                else resolve( prepareDatabase( GM_getValue("database") ) );

            } catch(e) {

                var reason = e;
                reject('Could not grab the data from the database because the following error occured: '+reason);
            }
        });

    } catch(e) {

        var reason = e;
        reject('Could not grab the data from the database because the following error occured: '+reason);
    }
});

MF_database = getDatabase;



if (window.location.hostname.toLowerCase() == 'greasyfork.org' && window.location.pathname.toLowerCase() == '/modfather') {

    var header, text;
    if (( header = document.getElementById('main-header') )) header.hidden = true;
    if (( text = document.getElementsByClassName('text-content')[0] )) text.innerHTML = "<h1>Don't close this webpage!</h1><p>TagPro ModFather is trying to find out what scripts you have installed. This tab will close automatically within a few seconds.</p>";
    document.title = "Do not close!";
    document.querySelector('link[rel=icon]').href = "http://koalabeast.com/favicon.ico";




    var checkScripts = function(){
        GM_setValue('TampermonkeyInstalled',true);

        getDatabase.then(function(database){

            var pending = 0,
                installedMods = {};

            database.MODS.forEach( function(mod,m) {

                pending++;

                TM.isInstalled( mod.NAME, mod.NAMESPACE, function(result) {
                    installedMods[m] = result;
                    mod.INSTALLED = result;

                    if (--pending == 0) { // If all mods are checked
                        GM_setValue('installedMods', installedMods);

                        window.close();

                        if (text) text.innerHTML = "<h1>You may close this webpage</h1><p>TagPro ModFather has found out what scripts you have installed. Automatically closing this window failed, you may do that now.</p>";
                        document.title = "Close me";
                    }
                });
            });

        });
    };




    if (!window.external) {
        GM_setValue('TampermonkeyInstalled',false);
        window.close();
    }

    else {
        var TM = window.external.Tampermonkey;
        if (TM) checkScripts();
        else setTimeout(function(){
            if (TM) checkScripts();
            else {
                GM_setValue('TampermonkeyInstalled',false);
                window.close();
            }
        },1e3);
    }

    return;
}



cs = function checkScripts(){
    var gf_tab = GM_openInTab('https://greasyfork.org/modfather',true);
    gf_tab.onclose = function(){
        // The installe scripts should now be available
        console.log(  GM_getValue('installedMods') );
    };
};



var navBar = document.getElementById('site-nav');      // This is that menu bar on the top of every homepage (Groups, Leaderboards, Maps... etc.)

if (navBar) {         // If you are on a page with the navBar (I guess everywhere except in-game)


    // Create the button

    var navButton = document.createElement('li');
    navButton.id = 'nav-modfather';
    navButton.innerHTML = '<a href="/modfather" style="color:#8BC34A">ModFather</a>';

    // Add it between the 'maps' and 'texture pack' button.
    navBar.getElementsByTagName('ul')[0].insertBefore(navButton, document.getElementById('nav-textures') );


}



// If we are on the /ModFather page (after clicking on the button)
if (window.location.pathname.toLowerCase() == '/modfather') {


    // Make the navBar button active
    navButton.classList.add('active-tab');
    // Change the page title
    document.title = 'TagPro ModFather';


    // Add ModFather content to the page

    for (var MF_content of document.body.children) if (MF_content.classList.contains('container')) break;

    MF_content.innerHTML = `<div class="row"><div class="col-md-12">  <h1 class="header-title">ModFather</h1>  <ul id="MF_tablist" class="tab-list"></ul>  <div id="MF_tabcontent" class="tab-content">`;

    MF_tablist    = document.getElementById('MF_tablist');
    MF_tabcontent = document.getElementById('MF_tabcontent');


    // Add some tabs to the tablist

    var list_tab = MF_tablist.appendChild( document.createElement('li') );
    list_tab.innerHTML = '<a>List view</a>';
    list_tab.onclick = ()=>selectTab('list');
    list_tab.id = 'MF_tab_list';

    var tile_tab = MF_tablist.appendChild( document.createElement('li') );
    tile_tab.innerHTML = '<a>Tile view</a>';
    tile_tab.onclick = ()=>selectTab('tile');
    tile_tab.id = 'MF_tab_tile';

    var info_tab = MF_tablist.appendChild( document.createElement('li') );
    info_tab.innerHTML = '<a>Information</a>';
    info_tab.onclick = ()=>selectTab('info');
    info_tab.id = 'MF_tab_info';


    // Add the corresponding content containers of those tabs to the page

    var list_content = MF_tabcontent.appendChild( document.createElement('div') );
    list_content.className = 'tab-pane';
    list_content.id = 'MF_content_list';

    var tile_content = MF_tabcontent.appendChild( document.createElement('div') );
    tile_content.className = 'tab-pane';
    tile_content.id = 'MF_content_tile';

    var info_content = MF_tabcontent.appendChild( document.createElement('div') );
    info_content.className = 'tab-pane';
    info_content.id = 'MF_content_info';


    // Select the right tab based on the URL hash

    selectTab();





    // Put some content in the content containers; first, the 'List Mods' tab

    // Add the explanation above the mods
    list_content.innerHTML += '<div class="row">  <div class="col-xs-12"> <p class="explanation-bubble"> Customize TagPro by installing mods. <span id="sort-options-list" class="pull-right"> Sort by ';
    var sort_options_list = document.getElementById('sort-options-list');

    // Add some sort options (same style as the texture pack selector)
    sort_options_list.innerHTML += '<span class="sort mod-sort" onclick=MF_setSort("name")><a> Name ';
    sort_options_list.innerHTML += '<span class="sort mod-sort" onclick=MF_setSort("hot")><a> Hot ';
    sort_options_list.innerHTML += '<span class="sort mod-sort" onclick=MF_setSort("new")><a> New ';
    sort_options_list.innerHTML += '<span class="sort mod-sort" onclick=MF_setSort("top")><a> Top ';

    list_content.children[0].innerHTML += '<div class="col-md-12"> <table class="table table-stripped"><col width=1><col width=1><col width=1><thead id="list-thead"></thead><tbody id="list-tbody"></tbody>';

    var list_thead = document.getElementById('list-thead');
    var list_tbody = document.getElementById('list-tbody');


    list_thead.innerHTML = '<tr> <th title=Icon>  <th title=Installs> I  <th title=Upvotes> U  <th> Name  <th> Summary  <th> Tags  <th> Authors  <th>';

    list_tbody.innerHTML = '<td colspan=100 align=center> <div class=spinner> <div class=spinner-item></div> <div class=spinner-item></div> <div class=spinner-item></div> <div class=spinner-item></div>';

    getDatabase.then(function(database) {

        for (var mod of database.MODS) {

            mod.LIST = document.createElement('tr');

            mod.LIST.innerHTML += '<td> <img width=24 height=24 src=' + mod.ICON + '>';
            mod.LIST.innerHTML += '<td> ? ';
            mod.LIST.innerHTML += '<td> ? ';
            mod.LIST.innerHTML += '<td>' + mod.NAME;
            mod.LIST.innerHTML += '<td>' + mod.SUMMARY;

            mod.LIST.innerHTML += '<td>';
            for (var tag of mod.TAGS)
                mod.LIST.lastChild.innerHTML += '<span class="sort tag-filter" onclick=MF_setTagFilter("' + tag + '")><a>' + tag + '</a></span> ';

            mod.LIST.innerHTML += '<td>';
            for (var author of mod.AUTHORS)
                mod.LIST.lastChild.innerHTML += '<span class="sort author-filter" onclick=MF_setAuthorFilter("' + author.NAME + '")><a>' + author.NAME + '</a></span> ';

            mod.LIST.innerHTML += '<td><a href="' +mod.LINK+ '"> install!';

        }

        update_sort_filter();
    });



    var sort_filter = {
        sort: 'name',
        tag_filter: null,
        author_filter: null,
    };

    MF_setSort = function(sort) {

        sort_filter.sort = sort;
        update_sort_filter();
    };

    MF_setTagFilter = function(tag_filter) {

        sort_filter.tag_filter = tag_filter;
        update_sort_filter();
    };

    MF_setAuthorFilter = function(author_filter) {

        sort_filter.author_filter = author_filter;
        update_sort_filter();
    };


    var update_sort_filter = function() {

        console.log('SORTING AND/OR FILTERING!!!!');

        var sort = sort_filter.sort,
            tag_filter = sort.tag_filter,
            author_filter = sort.author_filter;

        var sorted_filtered_mods = [];

        getDatabase.then( function(database) {

            for (let mod of database.MODS) {

                if (( !tag_filter || mod.TAGS.includes(tag_filter)) &&
                    ( !author_filter || mod.AUTHORS.reduce((c,n)=>c.concat(n.NAME),[]).includes(author_filter)) )
                    sorted_filtered_mods.push(mod);
            }

            if (sort == 'name')
                sorted_filtered_mods.sort( function(a,b) {
                    if ( a.NAME.toLowerCase < b.NAME.toLowerCase ) return -1;
                    if ( a.NAME.toLowerCase > b.NAME.toLowerCase ) return +1;
                    return 0;
                });

            // if (sort == 'hot')

            // if (sort == 'new')

            // if (sort == 'top')

            // Clear the list
            while (list_tbody.firstChild) list_tbody.removeChild(list_tbody.firstChild);

            // Fill again, but sorted && filtered

            for (let mod of sorted_filtered_mods)
                list_tbody.appendChild(mod.LIST);

        });
    };






    tile_content.innerHTML += '<div class="row">  <div class="col-xs-12"> <p class="explanation-bubble"> Customize TagPro by installing mods. <span id="sort-options-tile" class="pull-right"> Sort by ';
    var sort_options_tile = document.getElementById('sort-options-tile');

    // Add some sort options (same style as the texture pack selector)
    sort_options_tile.innerHTML += '<span class="sort" data-sort-name="Name"><a> Name ';
    sort_options_tile.innerHTML += '<span class="sort" data-sort-name="Author"><a> Author ';
    sort_options_tile.innerHTML += '<span class="sort" data-sort-name="Popularity"><a> Popularity ';
    sort_options_tile.innerHTML += '<span class="sort" data-sort-name="Upvotes"><a> Upvotes ';

    tile_content.innerHTML += 'No available mods. ModFather is still under construction. Click on <i>Information</i> if you want to help.';






    // Put some content in the content containers; thirdly, the 'info' tab
    info_content.innerHTML += 'This is the TagPro ModFather. If you want to help, send a message to <a href="https://www.reddit.com/message/compose/?to=Wilcooo">Ko</a><br>';

    info_content.innerHTML += '<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdIjXYaUa9Hzn3Sk6NHUkvBHAMBj6TAXsu9d8oUDCJjKwxhcQ/viewform?embedded=true" height="500" frameborder="0" marginheight="0" marginwidth="0">Bezig met laden...</iframe>';






    // Add some rules to the stylesheet
    // Find the correct styleSheet
    for (var styleSheet of document.styleSheets) if (styleSheet.href.includes('/style.css')) break;

    // The explanation-bubble appears above the mods list. (and contains the sort options)
    styleSheet.insertRule(".explanation-bubble { background: #383838; border-radius: 3px; border: 1px solid #3c3c3c; padding: 10px; margin-top: 0; }");
    styleSheet.insertRule(".sort { cursor: pointer }");

}




function selectTab(tab = window.location.hash.substr(1)) {

    // Set the hash (if needed)
    window.location.hash = tab;

    // Deselect all tabs
    MF_tablist.childNodes.forEach(tab=>tab.classList.remove('active'));
    MF_tabcontent.childNodes.forEach(content=>content.classList.remove('active'));

    try {
        document.getElementById('MF_tab_'+tab).classList.add('active');
        document.getElementById('MF_content_'+tab).classList.add('active');
    } catch(e) {
        console.log('ModFather: Tab not found:',tab);
        if (tab != 'list') selectTab('list');
    }
}
