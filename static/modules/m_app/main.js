// ***** Методы помощники

function map(nodeList, callback) {
    var inputList = Array.prototype.slice.call(nodeList);
    inputList.forEach(callback);
}

window.onload = function() {
//    $('.oveflow').css('display', 'none');
//    angular.element($('.overflow')).css('display', 'none');
    document.getElementsByClassName('overflow')[0].style.display = 'none';
};