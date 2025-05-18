FROM php:8.4-fpm

# Arguments pour la configuration
ARG MONGODB_VERSION=2.0.0

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

# Configuration PHP pour la production
RUN { \
    echo 'log_errors=1'; \
    echo 'display_errors=0'; \
    echo 'upload_max_filesize=32M'; \
    echo 'post_max_size=32M'; \
    echo 'memory_limit=512M'; \
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
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader

COPY . .

# Installation des dépendances et optimisation de l'autoloader
RUN composer dump-autoload --no-dev --optimize

# Optimisations Laravel
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && chown -R www-data:www-data /var/www \
    && chmod -R 775 storage bootstrap/cache\
    && mkdir -p /run/php \
    && chown www-data:www-data /run/php



    

# Exposition du port
EXPOSE 80

# Lancement des services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]