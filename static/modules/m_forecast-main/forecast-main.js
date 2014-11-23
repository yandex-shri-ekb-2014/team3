// ***** Обработчики кликов

// Открываем и закрываем выпадайку городов
if (typeof document.getElementsByClassName('towns__title')[0] != 'undefined') {
    document.getElementsByClassName('towns__title')[0].addEventListener('click', function (e) {
        var classes = document.getElementsByClassName('towns__list')[0];

        classes.classList.toggle('hidden');

        e.preventDefault();
    });
}

// Открываем попап при клике на справку
if (typeof document.getElementsByClassName('icon-help')[0] != 'undefined') {
    document.getElementsByClassName('icon-help')[0].addEventListener('click', function (e) {
        var parent = document.getElementsByClassName('icon-help')[0],
            popup = parent.getElementsByClassName('icon-help__popup')[0];

        popup.classList.toggle('hidden');

        e.preventDefault();
    });
}

// Вешаем активный город в выпадайке
(function() {
    var cityLinks = document.getElementsByClassName('towns-item__link'),
        setChecked = function (e) {
            document.getElementsByClassName('towns-item__link-active')[0].className = 'towns-item__link';
            this.className = 'towns-item__link towns-item__link-active';

            return false;
        };

    map(cityLinks, function(value, index, ar){ value.addEventListener('click', setChecked, false); })
})();
