<?php

/*namespace App\Services;

use Tymon\JWTAuth\Facades\JWTAuth;

class JwtService
/*{
    public function generateToken($user)
    {
        return JWTAuth::fromUser($user);
    }

    public function verifyToken($token)
    {
        return JWTAuth::setToken($token)->authenticate();
    }

    
}*/




namespace App\Services;

use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class JwtService
{
    /**
     * Générer un token JWT
     */
    public function generateToken($credentials)
    {
        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return null;
            }
        } catch (JWTException $e) {
            return null;
        }

        return $token;
    }

    /**
     * Récupérer l'utilisateur à partir du token JWT
     */
    public function getAuthenticatedUser()
    {
        try {
            if (!$user = JWTAuth::parseToken()->authenticate()) {
                return null;
            }
        } catch (JWTException $e) {
            return null;
        }

        return $user;
    }
}