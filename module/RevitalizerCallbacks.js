
window.toggleAll = function(source) {
    var checkboxes = document.getElementsByName('pir-actors');
    for(var i=0, n=checkboxes.length; i<n; i++) {
        checkboxes[i].checked = source.checked;
    }
};
