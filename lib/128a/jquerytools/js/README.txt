Upon upgrade:
* There's a patch to tabs.js (added line 127), to deal with the fact that jquerytools 
tabs just passes the current hash as a jQuery filter without sanitizing it.  
This didn't seem to be a problem pre-jQuery 1.5.x, so maybe that will force a fix in 
jquerytools... but needs to be checked when updating.