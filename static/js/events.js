window.onload = function () {

    // Открываем и закрываем выпадайку городов
    document.getElementsByClassName('towns__title')[0].addEventListener('click', function (e) {
        var classes = document.getElementsByClassName('towns__list')[0];

        classes.className != 'towns__list' ?
            classes.className = 'towns__list' :
            classes.className = 'towns__list hidden';

        e.preventDefault();
    });

    // Вешаем активный город в выпадайке
    var cityLinks = document.getElementsByClassName('towns-item__link'),
        setChecked = function (e) {
            document.getElementsByClassName('towns-item__link-active')[0].className = 'towns-item__link';
            this.className = 'towns-item__link towns-item__link-active';

            return false;
        };

    for(var i = 0; i < cityLinks.length; i++) {
        cityLinks[i].addEventListener('click', setChecked, false);
    }

    // Открываем попап при клике на справку
    document.getElementsByClassName('icon-help')[0].addEventListener('click', function (e) {
        var parent = document.getElementsByClassName('icon-help')[0],
            popup = parent.getElementsByClassName('icon-help__popup')[0];

        popup.className != 'icon-help__popup' ?
            popup.className = 'icon-help__popup' :
            popup.className = 'icon-help__popup hidden';

        e.preventDefault();
    });
};