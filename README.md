# Сеточка (setochka)

Сеточка&nbsp;— инструмент для выделения CSS-свойств исходного CSS в отдельные файлы. Также может использоваться для удаления этих свойств без записи.

## Предварительные требования

* OS Linux / Mac OS X
* nodejs версии 0.4.x&nbsp;— [http://nodejs.org](http://nodejs.org)
* npm&nbsp;— [http://github.com/isaacs/npm/](http://github.com/isaacs/npm/)

## Установка

Для установки следует выполнить команду `npm install setochka`.

Для обновления следует выполнить команду `npm update setochka`.

Для удаления следует выполнить команду `npm uninstall setochka`.

## Использование

Кратко (копия файла USAGE):

    setochka
    setochka -h
    setochka --help
        показывает этот текст
    setochka -v
    setochka --version
        показывает версию "Сеточки"
    setochka -i <CSS_filename>
    setochka --input <CSS_filename>
        принимает <CSS_filename> на вход
    setochka -a "alias0, alias1, aliasN"
    setochka --aliases "alias0, alias1, aliasN"
        перечисляет синонимы для использования
    setochka -mc <config_filename>
    setochka --merge-config <config_filename>
        совмещает настройки по умолчанию с настройками из <config_filename>
    setochka -rc <config_filename>
    setochka --replace-config <config_filename>
        замещает настройки по умолчанию настройками из <config_filename>
    setochka -l
    setochka --list
        показывает настройки

## Настройка

## Сценарии использования
