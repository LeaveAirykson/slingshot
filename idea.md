# Konzeptideen

## Eckpunkte

- anstatt node-ssh und ssh2 exec (von nodes "child process") verwenden (siehe shipit-js)
  - würde auch den privateKey parameter obsolet machen
  - weniger Abhängigkeiten

## Vorraussetzungen/Funktionen

- eine einzige config file (slingshot.prod.js) für configs und tasks
- "ignore" in config festlegen
- SSH key bereits auf remote eingetragen
- rsync zum übertragen
- rollback

## Events

- start
  bevor irgendwas passiert
- create
  es wurde nur der entsprechende release ordner erstellt
- uploaded
  es wurden die dateien hochgeladen
- finished
  alles erledigt

## Methods

### `.on(event, async cb())`

listen to event and run callback

### `.task(name, async cb())`

define a task and its function

### `.run(name)`

start a defined task

## Ordner struktur

- releases/
- current (symlink)
