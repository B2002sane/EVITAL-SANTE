<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class PasswordOublier extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'password_reset_tokens';

    protected $fillable = ['email', 'otp', 'created_at', 'otp_expires_at'];

    public $timestamps = false;
}
