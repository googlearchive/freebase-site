# Identity Criterion for American Football Player #
The general information on the Identity Criterion for various freebase types is given at <http://wiki.freebase.com/wiki/Identity_criterion_for_types>. If anyone in the community want any changes to be done to the identity criterion for /american\_football/football\_player, please make edits directly to the features and guidelines below.
<br /><br />
### Features for establishing identity relationships ###
#### name\_match ####
There is a _name\_match_ if the names of the football players or their aliases on both the sources match. The match may also be approximate due to the topics using football players' nick names, missing/extra middle names, prefix/suffix (such as Jr., Sr.), or initials.
#### current\_team\_match ####
There is a _team\_match_ if the player’s current team listed in Freebase property /american\_football/football\_player/current\_team (Current Team) is same on both the sources.
#### former\_team\_match ####
There is a _former\_team\_match_  if at least one of the player’s previous teams listed in Freebase property /american\_football/football\_player/former\_teams (Former Teams) matches with the teams on the other source.


<br /><br />
#### General guidelines for establishing identity between two American Football Players ####
Here are some typical patterns for determining identity of american football players:

  1. **_name\_match_** and **_current\_team\_match_** . ([Example 1](American_football_player_id_criteria#Example1.md))
  1. **_name\_match_** and **_former\_team\_match_**. ([Example 2](#Example2.md))

<br /><br />

### Additional Patterns and Features ###
Identity features, Patterns and Examples for following types are also applicable for establishing identity relationships in type /american\_football/football\_player:
  * type /people/person at http://wiki.freebase.com/wiki/Commons/people/person#Identity_Criterion_for_Person_type.
  * type /sports/pro\_athlete at  http://wiki.freebase.com/wiki/Commons/sports/athlete#Identity_Criterion_for_Athlete_type.


<br /><br />
### Examples ###


##### Example1 #####
(Pattern 1) : [Permalink](http://espn.go.com/nfl/player/_/id/5615/matt-schaub) Here the names of the football players and their current teams match on both the sources. Hence the american football players are identical.

<img src='http://freebase-site.googlecode.com/svn/wiki/Example218amefootplayer.png' height='420' width='720'>

<br /><br />

<h5>Example2</h5>
(Pattern 2) : <a href='http://www.aeispeakers.com/speakerbio.php?SpeakerID=1044'>Permalink</a> Here the names of the football players and their former teams match on both the sources. Hence the american football players are identical.<br>
<br>
<img src='http://freebase-site.googlecode.com/svn/wiki/Example219amefootplayer.png' height='420' width='720'>

<br /><br />