<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ConstanteVitaleController;
use App\Http\Controllers\DossierMedicalController;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\RendezVousController;
use App\Http\Controllers\DemandeDonController;
use App\Http\Controllers\AuthController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

# Routes pour la gestion des utilisateurs
Route::prefix('utilisateurs')->middleware('jwt.auth:MEDECIN_CHEF')->group(function () {
    Route::get('/', [UtilisateurController::class, 'index']);
    Route::post('/', [UtilisateurController::class, 'store']);
    Route::get('/{id}', [UtilisateurController::class, 'show']);
    Route::put('/{id}', [UtilisateurController::class, 'update']);
    Route::delete('/{id}', [UtilisateurController::class, 'destroy']);
});

# Routes pour la gestion des rendez-vous
Route::apiResource('rendez-vous', RendezVousController::class);
Route::get('patient/{patientId}/rendez-vous', [RendezVousController::class, 'getPatientRendezVous']);
Route::get('medecin/{medecinId}/rendez-vous', [RendezVousController::class, 'getMedecinRendezVous']);

# Routes pour les demandes de don
Route::get('medecins/{medecinId}/demandes-don', [DemandeDonController::class, 'index']);
Route::post('demandes-don', [DemandeDonController::class, 'store']);
Route::get('demandes-don/{id}', [DemandeDonController::class, 'show']);
Route::put('demandes-don/{id}', [DemandeDonController::class, 'update']);
Route::delete('demandes-don/{id}', [DemandeDonController::class, 'destroy']);
Route::get('demandes-don-disponibles/{groupeSanguin?}', [DemandeDonController::class, 'demandesDisponibles']);
Route::post('demandes-don/{id}/accepter', [DemandeDonController::class, 'accepterDemande']);

# Routes pour la gestion des constantes vitales
Route::post('/patients/{patientId}/constantes-vitales', [ConstanteVitaleController::class, 'addConstanteForPatient']);  //ajouter constante-vitale à un patient
Route::post('/dossiers-medicaux/{dossierMedicalId}/constantes-vitales', [ConstanteVitaleController::class, 'addconstanteForDossierMedical']); //ajouter constante-vitale à un dossier medical

# Routes pour la gestion des dossiers médicaux
Route::post('/patients/{patientId}/dossiers-medicaux', [DossierMedicalController::class, 'create']);  // Créer un nouveau dossier médical
Route::put('/dossiers-medicaux/{id}', [DossierMedicalController::class, 'update']);  // Mettre à jour un dossier médical existant
Route::get('/dossiers-medicaux/{id}', [DossierMedicalController::class, 'show']); // Afficher un dossier médical
Route::post('/dossiers-medicaux/{dossierMedicalId}/constantes-vitales', [DossierMedicalController::class, 'addConstanteVitale']); // Ajouter des constantes vitales
Route::post('/dossiers-medicaux/{dossierMedicalId}/rendez-vous', [DossierMedicalController::class, 'addRendezVous']);  // Ajouter un rendez-vous au dossier médical

# Routes pour le login
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']); // Déconnexion
Route::post('/login-by-card', [AuthController::class, 'loginByCard']);