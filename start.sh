#!/bin/bash
set -e

echo "=== Démarrage de l'application EVITAL-SANTE ==="

# Affichage des informations de débogage
echo "🔍 Environnement PHP :"
php -v
echo "🔍 Extensions PHP chargées (MongoDB) :"
php -m | grep -i mongo

# Vérification des permissions
echo "🔧 Configuration des permissions..."
chmod -R 775 /var/www/storage
chmod -R 775 /var/www/bootstrap/cache
chown -R www-data:www-data /var/www/storage
chown -R www-data:www-data /var/www/bootstrap/cache

# Préparation des répertoires de logs
mkdir -p /var/www/storage/logs
touch /var/www/storage/logs/laravel.log
chmod 775 /var/www/storage/logs/laravel.log

# Test de la connexion MongoDB
echo "🔍 Test de la connexion MongoDB..."
php -r "
try {
    \$manager = new MongoDB\Driver\Manager(getenv('MONGODB_DSN') ?: 'mongodb://127.0.0.1:27017');
    \$command = new MongoDB\Driver\Command(['ping' => 1]);
    \$manager->executeCommand('admin', \$command);
    echo \"✅ Connexion MongoDB réussie\n\";
} catch (Exception \$e) {
    echo \"❌ Erreur de connexion MongoDB: \" . \$e->getMessage() . \"\n\";
    echo \"⚠️ Vérifiez vos variables d'environnement MONGODB_DSN\n\";
}
"

# Optimisation de l'application
echo "🚀 Optimisation de l'application..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Appliquer le cache seulement en production
if [ "$APP_ENV" == "production" ]; then
    echo "🚀 Application des optimisations de production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Vérification de la présence d'une clé d'application
if php artisan key:status | grep -q "No application encryption key has been specified"; then
    echo "🔑 Génération d'une nouvelle clé d'application..."
    php artisan key:generate --force
else
    echo "✅ Clé d'application vérifiée"
fi

# Vérification de la configuration nginx
echo "🔍 Vérification de la configuration nginx..."
nginx -t

# Affichage des routes pour faciliter le débogage
echo "🛣️ Routes enregistrées:"
php artisan route:list --compact

echo "=== Démarrage des services web ==="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf