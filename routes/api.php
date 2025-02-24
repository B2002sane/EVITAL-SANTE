<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

#Route::apiResource('cohorte', CohorteController::class);
#Route::apiResource('departement', DepartementController::class);


#routes pour la gestion des utilisateurs
use App\Http\Controllers\UtilisateurController;

Route::prefix('utilisateurs')->group(function () {
    Route::get('/', [UtilisateurController::class, 'index']);
    Route::post('/', [UtilisateurController::class, 'store']);
    Route::get('/{id}', [UtilisateurController::class, 'show']);
    Route::put('/{id}', [UtilisateurController::class, 'update']);
    Route::delete('/{id}', [UtilisateurController::class, 'destroy']);
});


#routes pour le gestion des rendez vous
use App\Http\Controllers\RendezVousController;

Route::apiResource('rendez-vous', RendezVousController::class);
Route::get('patient/{patientId}/rendez-vous', [RendezVousController::class, 'getPatientRendezVous']);
Route::get('medecin/{medecinId}/rendez-vous', [RendezVousController::class, 'getMedecinRendezVous']);


# routes pour les demandes de don
use App\Http\Controllers\DemandeDonController;

Route::get('medecins/{medecinId}/demandes-don', [DemandeDonController::class, 'index']);
Route::post('demandes-don', [DemandeDonController::class, 'store']);
Route::get('demandes-don/{id}', [DemandeDonController::class, 'show']);
Route::put('demandes-don/{id}', [DemandeDonController::class, 'update']);
Route::delete('demandes-don/{id}', [DemandeDonController::class, 'destroy']);

Route::get('demandes-don-disponibles/{groupeSanguin?}', [DemandeDonController::class, 'demandesDisponibles']);
Route::post('demandes-don/{id}/accepter', [DemandeDonController::class, 'accepterDemande']);