FROM php:8.4-fpm

# Arguments
ARG MONGODB_VERSION=2.0.0

# Installation dépendances système
RUN apt-get update && apt-get install -y \
    git curl libssl-dev pkg-config libzip-dev unzip nginx supervisor \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Extensions PHP
RUN pecl install mongodb-${MONGODB_VERSION} \
    && docker-php-ext-enable mongodb \
    && docker-php-ext-install pdo_mysql zip opcache

# Configuration OPcache & PHP
RUN echo 'opcache.memory_consumption=128\n\
opcache.interned_strings_buffer=8\n\
opcache.max_accelerated_files=4000\n\
opcache.revalidate_freq=2\n\
opcache.fast_shutdown=1\n\
opcache.enable_cli=1' > /usr/local/etc/php/conf.d/opcache-recommended.ini \
    && echo 'log_errors=1\n\
display_errors=0\n\
upload_max_filesize=32M\n\
post_max_size=32M\n\
memory_limit=512M' > /usr/local/etc/php/conf.d/production.ini

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Nginx & Supervisor config
COPY docker/nginx/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Définir le dossier de travail
WORKDIR /var/www

# Copier le code complet du projet (inclut composer.json, .env, etc.)
COPY . .

# Installer les dépendances Laravel
RUN composer install --no-dev --optimize-autoloader

# Générer la clé et mettre en cache
RUN php artisan key:generate \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Droits d’accès
RUN chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache \
    && mkdir -p /run/php \
    && chown www-data:www-data /run/php

# Port exposé
EXPOSE 80

# Lancer les services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
