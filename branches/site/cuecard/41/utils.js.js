CueCard.Utils = {};

CueCard.Utils.getPaddingsMargins = function(win, elmt) {
    if (win.getComputedStyle) {
        var style = win.getComputedStyle(elmt, null);
        return {
            paddingTop: style.getPropertyValue('padding-top'),
            marginTop:  style.getPropertyValue('margin-top'),
            paddingLeft: style.getPropertyValue('padding-left'),
            marginLeft:  style.getPropertyValue('margin-left')
        };
    } else {
        var style = elmt.currentStyle;
        return {
            paddingTop: style.paddingTop,
            marginTop:  style.marginTop,
            paddingLeft:  style.marginLeft,
            marginLeft:  style.marginLeft
        };
    }
};