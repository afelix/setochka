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

## Настройки

Файл настроек представляет собою JavaScript-файл.

### Структура файла настроек

    exports.config = {
        outFile: function(filename) { return .. },         <- имя файла для записи CSS без отфильтрованных свойств
        aliases: {                                         <- набор синонимов
            'синоним0': {                                  <- уникальный синоним для группирования настроек
                mark: 'метка',                             <- метка для маркировки свойства
                description: 'краткое описание',           <- краткое описание синонима
                outFile: function(filename) { return .. }, <- имя файла для записи выделенных свойств
                tokens: {                                  <- токены для сверки с шаблоном
                    'declaration': [/.. regexp ../, ..]    <- CSS-свойство в целом
                    'property': [/.. regexp ../, ..]       <- имя CSS-свойства
                    'value': [/.. regexp ../, ..]          <- значение CSS-свойства
                }
            },
            'синоним1': {
                ..
            },
            'синонимN': {
                ..
            }
        }
    }
### outFile

Функция, возвращающая имя файла, в который следует записывать результат обработки. В случае с outFile высшего уровня (не относящийся к alias) это CSS, из которого отфильтровали свойства. В случае с alias.outFile это файл, в который записываются все свойства, попавшие под шаблоны.

Если outFile отсутствует или его значение равно `false` (`null`, `undefined`, пустая строка, `0`), файл записан не будет. Этим можно пользоваться для удаления свойств.

### aliases

Синоним (alias)&nbsp;— имя группы, в которую включаются шаблоны, метка, описание, настройки исходящего файла и всё прочее, что имеет смысл вносить в группу. Группа, в свою очередь, нужна для того, чтобы пользователь мог уникально идентифицировать наборы шаблонов и применять их посредством вызова. В общем, очевидная концепция.

### alias.mark

Маркер, которым в CSS помечаются свойства для безусловной фильтрации: свойство будет перемещено вне зависимости от того, попадает оно под шаблоны или нет. В CSS маркер должен быть заключён в комментарий и находиться до свойства, при этом между маркером и свойством не должно быть пробелов и чего-либо ещё:

    .test {
        /*webkit*/color: red
    }

### alias.description

Краткое описание синонима.

### alias.tokens

Токен представляет собою имя CSS-части (токена), к которой применять шаблоны. Шаблон&nbsp;— регулярное выражение JavaScript. Если текстовое представление токена соответствует шаблону, свойство (NB: свойство целиком!), к которому относится эта часть, выделяется.

Напоминание: в CSS свойство – это `declaration` в виде `property:value`.

* `declaration`&nbsp;— массив шаблонов для применения к свойству целиком.
* `property`&nbsp;— массив шаблонов для применения к именам свойств.
* `value`&nbsp;— массив шаблонов для применения к значениям свойств.

### Пример

    exports.config = {
        outFile: function(filename) { return 'base.' + filename },
        aliases: {
            'moz': {
                mark: 'moz',
                description: 'Gecko (Mozilla): -moz-',
                outFile: function(filename) { return 'moz.' + filename },
                tokens: {
                    'property': [/^\-moz\-/]
                }
            }
        }
    }

## Сценарии использования

Основным сценарием использования видится выделение вендорных свойств по шаблонам&nbsp;— то, ради чего создана Сеточка, и под эту задачу созданы настройки по умолчанию, которые можно посмотреть [здесь](http://nodejs.org).

Если пользователь нуждается в переопределении или дополнении настроек (вероятно, изменение имени исходящих файлов или дополнение настроек), следует использовать сценарии "Дополнение настроек" и "Замещение настроек".

### Выделение свойств по шаблону

В настройках должны быть заполнены следующие параметры:

* config.outFile
* config.aliases.alias.outFile
* config.aliases.alias.tokens и / или config.aliases.alias.mark

Запуск: `setochka -i my.css`

### Удаление свойств

В настройках должны быть заполнены следующие параметры:

* config.outFile
* config.aliases.alias.tokens и / или config.aliases.alias.mark

Этот параметр должен быть пустым (или иметь значение, равное `false`):

* config.aliases.alias.outFile

Запуск: `setochka -i my.css`

### Дополнение настроек

При дополнении настроек пользовательские настройки замещают собою пересекающуюся часть настроек по умолчанию, а также дополняют то, чего в настройках не было. NB: массивы шаблонов не дополняются, но замещаются целиком!

Пример настроек по умолчанию (фактические отличаются):

    exports.config = {
        outFile: function(filename) { return 'base.' + filename },
        aliases: {
            'moz': {
                mark: 'moz',
                description: 'Gecko (Mozilla): -moz-',
                outFile: function(filename) { return 'moz.' + filename },
                tokens: {
                    'property': [/^\-moz\-/]
                }
            }
        }
    }

Пример пользовательских настроек (`/foo/bar/myconfig.js`):

    exports.config = {
        outFile: function(filename) { return 'my.' + filename },
        aliases: {
            'moz': {
                tokens: {
                    'property': [/^\-moz\-color/],
                    'value': [/^\mozilla\-/]
                }
            },
            'test': {
                mark: 'test'
            }
        }
    }

Итог:

    exports.config = {
        outFile: function(filename) { return 'my.' + filename },
        aliases: {
            'moz': {
                mark: 'moz',
                description: 'Gecko (Mozilla): -moz-',
                outFile: function(filename) { return 'moz.' + filename },
                tokens: {
                    'property': [/^\-moz\-color/],
                    'value': [/^\mozilla\-/]
                }
            },
            'test': {
                mark: 'test'
            }
        }
    }

Запуск: `setochka -i my.css -mc /foo/bar/myconfig.js`

### Замещение настроек

Запуск: `setochka -i my.css -rc /foo/bar/myconfig.js`
