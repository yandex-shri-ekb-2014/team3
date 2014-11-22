// ***** Методы помощники

function map(nodeList, callback) {
    var inputList = Array.prototype.slice.call(nodeList);
    inputList.forEach(callback);
}