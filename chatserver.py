#az "app" csomag importálása
#minden mappa, amiben van "__init__.py", az csomag, és azt végre is hajtja.
#így a kifejezés az app mappa __init__.py kódjában létrehozott szerverpéldányt indítja.

from app import app