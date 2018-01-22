# TagPro ModFather

### Basic idea
 1. A database, hosted somewhere, that stores links to all userscripts & extensions of TagPro.
 2. A userscript that lists them all on the servers’ websites.


### Extra
(a) A system for userscript authors and/or moderators of ModFather to submit new scripts, and update/edit the data.
(b) A system to count installs and upvotes, and maybe somehow keeps track of which scripts are installed.
(c) Reviews by users, and a report system

## 1. The database
Stores the following data for each mod. Bold means required, the rest in order of recommendation. (I would *at least* include everything up to the image)

  + **Direct link to the script**
  + **Mod name**
  + **Mod Author(s)**  
    Can be a list of multiple, so that it's still possible to "view all mods by this author"
  + Update history  
    List of version, date, [release notes]  
    At the minimum just the last date, which could default to when the script was submitted to the ModFather.
  + Short description  
    just a few words  
    Could be stolen from the scripts metadata when missing (or always?)
  + Tags [list]
  + 1 image (external host)  
    Will be shown in tile-view  
    More images could be added to the description
  + Long description  
    Written in markdown to make copying from a reddit post easy
  + Icon (external host)  
    Will be shown in list-view  
    Could be stolen from the scripts metadata when missing (or always?)
  + Reddit post link
  + GitHub repo/other source link

These two lists won't be public, but are needed to count the number of installs and upvotes.

  + Installed by who [list of (hashed?) TagPro profile id’s]
  + Upvoted by who [list of (hashed?) TagPro profile id’s]

### Tags
Scripts may have multiple tags

  + Aesthetic
  + Informative
  + Interface
  + Statistics
  + Visual
  + Auditory
  + In-game
  + Out-game
  + Chat
  + Communication
  + Spectating
  + Gimmick
  + Beta

Tags should be given conservative, an in-game modifier with just settings on the homepage shouldn't also be 'out-game'. A script that puts a statistic on every ball shouldn't be 'visual', because the purpose of the script is being informative. People won't click 'visual' if they want to get statistics scrits. 'Spectating' tag should only be given to scripts specifically made for speccers, not to visual enhancing scripts that also happen to look nice while spectating.

### Hosting options
**reddit**: scripts should be posted to /r/ModFather in a certain format. They can be edited by only the original poster though :/ upvotes can just be a reddit plugin (maybe). Installs? No idea

**reddit wiki**: Anyone can edit, there's karma requirement, moderator approvement.. It'll feel like doing double work, with the regular wiki also existing. Upvotes and installs? No idea

**Google sheets**: possibility to make API's, submissions via Google forms. Upvotes/installs via simple API's, results can be (partially) hidden. Reports ez via form.

**"Real" database**: (Payd) hosting of a simple database with an accessible API

## 2. Script or extension
New tab on homepage.  
Fetch data from whatever database is used  
Checks if tamper installed, display an install message if not  
Somehow checks what scripts are installed, mark them  
Somehow verifies who is logged in, for voting and install counts  

### How to verify a user
We could just assume the user doesn't hack, we can just copy profileId from profile button. Downsides: a hacker could give a script a thousend upvotes/installs by spoofing his profileId.

Only real way is to:

1. let ModFather send a verification request to our server
2. The server comes up with a random flair that the user should select
3. ModFather selects that flair in the background
4. The server can check if the flair has changed, if so, the user is verified.
5. (ModFather chances the flair back to what it was)

This should happen within seconds, so that a hacker can't manipulate others to select a certain flair. And even if so, it'll be way too difficult for the hacker to significantly increase a mods upvote/install count.

### How to test what scripts are installed?
?
