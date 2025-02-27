<?php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;

class JwtAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $role
     * @return mixed
     */
    public function handle($request, Closure $next, $role = null)
    {
        try {
            // Authentifier l'utilisateur via le token JWT
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json(['status' => false, 'message' => 'Utilisateur non trouvé'], 404);
            }

            // Vérifier le rôle de l'utilisateur si un rôle est spécifié
            if ($role && $user->role !== $role) {
                return response()->json(['status' => false, 'message' => 'Accès non autorisé'], 403);
            }

        } catch (TokenExpiredException $e) {
            return response()->json(['status' => false, 'message' => 'Token expiré'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['status' => false, 'message' => 'Token invalide'], 401);
        } catch (JWTException $e) {
            return response()->json(['status' => false, 'message' => 'Token absent'], 401);
        }

        return $next($request);
    }
}