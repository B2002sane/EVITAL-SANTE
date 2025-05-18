FROM php:8.2-fpm

# Arguments pour la configuration
ARG MONGODB_VERSION=1.16.1

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libssl-dev \
    pkg-config \
    libzip-dev \
    unzip \
    nginx \
    supervisor \
    libcurl4-openssl-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installation des extensions PHP nécessaires
RUN pecl install mongodb-${MONGODB_VERSION} \
    && docker-php-ext-enable mongodb \
    && docker-php-ext-install pdo_mysql zip opcache

# Configuration d'OPcache pour la production
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=2'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Configuration PHP pour la production et MongoDB
RUN { \
    echo 'log_errors=1'; \
    echo 'display_errors=0'; \
    echo 'upload_max_filesize=32M'; \
    echo 'post_max_size=32M'; \
    echo 'memory_limit=512M'; \
    echo 'default_socket_timeout=300'; \
    echo 'max_execution_time=300'; \
    } > /usr/local/etc/php/conf.d/production.ini

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuration de Nginx
COPY docker/nginx/nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Configuration de Supervisor
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Définition du répertoire de travail
WORKDIR /var/www

# Copie des fichiers de l'application
COPY . .

# Installation des dépendances et optimisation de l'autoloader
RUN composer install --no-dev --optimize-autoloader

# Création des répertoires de logs et configuration des permissions
RUN mkdir -p /var/www/storage/logs \
    && touch /var/www/storage/logs/laravel.log \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache \
    && mkdir -p /run/php \
    && chown -R www-data:www-data /var/www \
    && chown www-data:www-data /run/php

# Exposition du port
EXPOSE 80

# Script de démarrage pour configurer l'application au lancement
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Lancement des services
CMD ["/start.sh"]