<?php

use Illuminate\Support\Facades\Mail;

Mail::raw('Test email Laravel via Gmail SMTP', function ($message) {
    $message->to('bintousane69@gmail.com')
            ->subject('Test Email');
});

echo "Email envoyé avec succès !\n";
