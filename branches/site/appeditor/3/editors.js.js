// EDITORS is a registry of the constructor, default configuration 
// and supported features for each editor

var EDITORS = {};

/*
    FEATURES    :
        * hotswap               - ability to switch editors on the fly (pure text editors only)
        * mimetype_change       - ability to switch mime-types on the fly
        * margin                - show margin with linenumbers, etc.
        * linenumbers           - show linenumber, go to line
        * softwrap              - able to switch between hard and soft-wrap
        * undo                  - supports undoing and redoing
        * indent                - support re-indenting selection
        * inline_preview        - previews within editor... disable View and View with Console (query only)

    EVENTS      :
        * change(undos, redos)  - on any text change
        * linechange(num)       - whenever the linenumber changes
        * newframe(element)     - hack for dealing with attaching new handlers for frames
*/
