FROM php:8.3-fpm

# Arguments pour MongoDB
ARG MONGODB_VERSION=2.0.0

# Dépendances système
RUN apt-get update && apt-get install -y \
    git curl unzip libssl-dev pkg-config libzip-dev \
    nginx supervisor \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Extensions PHP
RUN pecl install mongodb-${MONGODB_VERSION} \
    && docker-php-ext-enable mongodb \
    && docker-php-ext-install pdo_mysql zip opcache

# PHP Production config
RUN echo 'opcache.memory_consumption=128' > /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'log_errors=1' > /usr/local/etc/php/conf.d/error.ini \
    && echo 'display_errors=0' >> /usr/local/etc/php/conf.d/error.ini \
    && echo 'upload_max_filesize=32M' >> /usr/local/etc/php/conf.d/error.ini \
    && echo 'post_max_size=32M' >> /usr/local/etc/php/conf.d/error.ini \
    && echo 'memory_limit=512M' >> /usr/local/etc/php/conf.d/error.ini

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuration Nginx et Supervisor
COPY docker/nginx/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Logs via stdout/stderr
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

WORKDIR /var/www

# Copie fichier d’environnement
COPY .env .env

# Copie fichiers Composer
COPY composer.json composer.lock ./

# Dépendances PHP
RUN composer install --no-dev --no-scripts --no-autoloader

# Copie de l’application
COPY . .

# Dump autoloader optimisé
RUN composer dump-autoload --no-dev --optimize

# Cache de config & routes uniquement (API)
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan key:generate --force \
    && mkdir -p storage/logs \
    && touch storage/logs/laravel.log \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache

# Port exposé (Render, Heroku, etc.)
EXPOSE 80

# Lancement via supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
