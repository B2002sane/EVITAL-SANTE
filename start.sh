#!/bin/bash

# Lancer supervisord pour démarrer nginx et php-fpm
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
