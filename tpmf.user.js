// ==UserScript==
// @name          TagPro ModFather
// @description   Shows available mods on the TagPro website, Notifies when new Mods are released, And more...
// @author        Ko
// @version       0.1
// @match         http://*.koalabeast.com/*
// @supportURL    https://www.reddit.com/message/compose/?to=Wilcooo
// @website       https://redd.it/no-post-yet
// @icon          https://raw.githubusercontent.com/wilcooo/TagPro-ModFather/master/icon.png
// @download      https://raw.githubusercontent.com/wilcooo/TagPro-ModFather/master/tpmf.user.js
// @license       MIT
// ==/UserScript==



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

    var mods_tab = MF_tablist.appendChild( document.createElement('li') );
    mods_tab.innerHTML = '<a>Available Mods</a>';
    mods_tab.onclick = ()=>selectTab('mods');
    mods_tab.id = 'MF_tab_mods';

    var info_tab = MF_tablist.appendChild( document.createElement('li') );
    info_tab.innerHTML = '<a>Information</a>';
    info_tab.onclick = ()=>selectTab('info');
    info_tab.id = 'MF_tab_info';


    // Add the corresponding content containers of those tabs to the page

    var mods_content = MF_tabcontent.appendChild( document.createElement('div') );
    mods_content.className = 'tab-pane';
    mods_content.id = 'MF_content_mods';

    var info_content = MF_tabcontent.appendChild( document.createElement('div') );
    info_content.className = 'tab-pane';
    info_content.id = 'MF_content_info';


    // Select the right tab based on the URL hash

    selectTab();





    // Put some content in the content containers; first, the 'Available Mods' tab

    // Add the explanation above the mods
    mods_content.innerHTML += '<div class="row">  <div class="col-xs-12"> <p class="explanation-bubble"> Customize TagPro by installing mods. <span id="sort-options" class="pull-right"> Sort by ';
    var sort_options = document.getElementById('sort-options');

    // Add some sort options (same style as the texture pack selector)
    sort_options.innerHTML += '<span class="sort" data-sort-name="Name"><a> Name ';
    sort_options.innerHTML += '<span class="sort" data-sort-name="Author"><a> Author ';
    sort_options.innerHTML += '<span class="sort" data-sort-name="Popularity"><a> Popularity ';
    sort_options.innerHTML += '<span class="sort" data-sort-name="Upvotes"><a> Upvotes ';

    mods_content.innerHTML += 'No available mods. ModFather is still under construction. Click on <i>Information</i> if you want to help.';



    // Put some content in the content containers; second, the 'Available Mods' tab
    info_content.innerHTML += 'This is the TagPro ModFather. If you want to help, send a message to <a href="https://www.reddit.com/message/compose/?to=Wilcooo">Ko</a>';






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
        if (tab != 'mods') selectTab('mods');
    }
}
