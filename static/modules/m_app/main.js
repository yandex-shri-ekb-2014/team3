// ***** Методы помощники

function map(nodeList, callback) {
    var inputList = Array.prototype.slice.call(nodeList);
    inputList.forEach(callback);
}

window.onload = function () {
    document.getElementsByClassName('overflow')[0].style.display = 'none';
};