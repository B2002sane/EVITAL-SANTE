<?php


use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\RendezVousController;
use App\Http\Controllers\DemandeDonController;
use App\Http\Controllers\ConstanteVitaleController;
use App\Http\Controllers\ChambreController;
use App\Http\Controllers\PasswordOublierController;
use App\Http\Controllers\VisiteController;



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');




//routes pour la gestion des utilisateurs
Route::prefix('utilisateurs')->group(function () {
    Route::get('/', [UtilisateurController::class, 'index']);
    Route::post('/', [UtilisateurController::class, 'store']);
    Route::get('/{id}', [UtilisateurController::class, 'show']);
    Route::put('/{id}', [UtilisateurController::class, 'update']);
    Route::delete('/{id}', [UtilisateurController::class, 'destroy']);
    Route::post('/destroy-multiple', [UtilisateurController::class, 'destroyMultiple']);
});







//routes pour le gestion des rendez vous
Route::apiResource('rendez-vous', RendezVousController::class);
Route::get('patient/{patientId}/rendez-vous', [RendezVousController::class, 'getPatientRendezVous']);
Route::get('medecin/{medecinId}/rendez-vous', [RendezVousController::class, 'getMedecinRendezVous']);
// Demande de rendez-vous par un patient
Route::post('/rendez-vous/demander', [RendezVousController::class, 'demanderRendezVous']);
// Récupérer les demandes en attente pour un médecin
Route::get('/medecins/{medecinId}/demandes', [RendezVousController::class, 'getDemandesEnAttente']);
// Accepter une demande de rendez-vous
Route::patch('/rendez-vous/{id}/accepter', [RendezVousController::class, 'accepterDemande']);
//demande de rendez vous en attente pour un medecin
Route::get('/rendez-vous/attente/{medecinId}', [RendezVousController::class, 'getDemandesEnAttente']);
// rendez vous creer par le  medecin
Route::get('/rendez-vous/medecin/{medecinId}', [RendezVousController::class, 'getMedecinRendezVous']);
Route::get('/rendez-vous/patient/{patientId}', [RendezVousController::class, 'getPatientRendezVous']);
Route::get('/rendez-vous/date/{date}', [RendezVousController::class, 'indexByDate']);






// routes pour les demandes de don
Route::get('demandes-don', [DemandeDonController::class, 'indexAll']);
Route::get('medecins/{medecinId}/demandes-don', [DemandeDonController::class, 'index']);
Route::post('demandes-don', [DemandeDonController::class, 'store']);
Route::get('demandes-don/{id}', [DemandeDonController::class, 'show']);
Route::put('demandes-don/{id}', [DemandeDonController::class, 'update']);
Route::delete('demandes-don/{id}', [DemandeDonController::class, 'destroy']);
Route::get('demandes-don-disponibles/{groupeSanguin?}', [DemandeDonController::class, 'demandesDisponibles']);
Route::post('demandes-don/{id}/accepter', [DemandeDonController::class, 'accepterDemande']);
Route::post('demandes-don/{id}/annuler', [DemandeDonController::class, 'annulerDemande']);



// routes pour la gestion des chambres
// Routes CRUD de base
Route::apiResource('chambres', ChambreController::class);
// Routes supplémentaires pour la gestion des lits
Route::post('chambres/{id}/assigner-lit', [ChambreController::class, 'assignerLit']);
Route::post('chambres/{id}/liberer-lit', [ChambreController::class, 'libererLit']);
Route::get('chambres-disponibles', [ChambreController::class, 'chambresDisponibles']);
Route::get('chambres/{id}/statut', [ChambreController::class, 'statutOccupation']);
// // Route pour obtenir les patients non hospitalisés
Route::get('/patients/non-hospitalises', [ChambreController::class, 'getPatientsNonHospitalises']);






// Routes pour la gestion des constantes vitales
Route::post('/patients/{patientId}/constantes-vitales', [ConstanteVitaleController::class, 'addConstanteForPatient']);  //ajouter constante-vitale à un patient
Route::post('/dossiers-medicaux/{dossierMedicalId}/constantes-vitales', [ConstanteVitaleController::class, 'addconstanteForDossierMedical']); //ajouter constante-vitale à un dossier medical



use App\Http\Controllers\DossierMedicalController;
// # Routes pour la gestion des dossiers médicaux
// Route::post('/patients/{patientId}/dossiers-medical', [DossierMedicalController::class, 'create']);  // Créer un nouveau dossier médical
// Route::put('/dossiers-medicaux/{id}', [DossierMedicalController::class, 'update']);  // Mettre à jour un dossier médical existant
// Route::post('/dossiers-medicaux/{dossierMedicalId}/rendez-vous', [DossierMedicalController::class, 'addRendezVous']);  // Ajouter un rendez-vous au dossier médical



// route pour la gestion des mots de passe oubliés
Route::post('forgot', [PasswordOublierController::class, 'sendResetLink']);
Route::post('reset', [PasswordOublierController::class, 'resetPassword']);



// route pour changer un mot de passe
Route::middleware(['jwt.auth'])->group(function () {
    Route::post('change-password', [AuthController::class, 'changePassword']);
});



//route pour la gestion des constantes vitals
Route::post('/patients/{patientId}/constantes-vitales', [ConstanteVitaleController::class, 'addConstanteForPatient']);  //ajouter constante-vitale à un patient
Route::post('/dossiers-medicaux/{dossierMedicalId}/constantes-vitales', [ConstanteVitaleController::class, 'addconstanteForDossierMedical']); //ajouter constante-vitale à un dossier medical



// Routes pour la gestion des dossiers médicaux
Route::post('/patients/{patientId}/dossiers-medicaux', [DossierMedicalController::class, 'create']);  // Créer un nouveau dossier médical
Route::put('/dossiers-medicaux/{id}', [DossierMedicalController::class, 'update']);  // Mettre à jour un dossier médical existant
Route::get('/dossiers-medicaux/{id}', [DossierMedicalController::class, 'show']); // Afficher un dossier médical
Route::delete('/dossiers-medicaux/{id}', [DossierMedicalController::class, 'delete']); // Supprimer un dossier médical
Route::post('/dossiers-medicaux/{dossierMedicalId}/constantes-vitales', [DossierMedicalController::class, 'addConstanteVitale']); // Ajouter des constantes vitales
Route::post('/dossiers-medicaux/{dossierMedicalId}/rendez-vous', [DossierMedicalController::class, 'addRendezVous']);  // Ajouter un rendez-vous au dossier médical
Route::post('dossiers-medicaux{dossierMedicalId}/rendez-vous', [DossierMedicalController::class, 'addRendezVous']); // Ajouter un rendez-vous au dossier médical
Route::post('/dossiers-medicaux/{dossierMedicalId}/visites', [DossierMedicalController::class, 'addVisite']); // Ajouter une visite au dossier médical



//route pour la gestion des visites

Route::prefix('visites')->group(function () {
    Route::get('/{dossierMedicalId}', [VisiteController::class, 'index']);
    Route::post('/', [VisiteController::class, 'store']);
    Route::get('/detail/{id}', [VisiteController::class, 'show']);
    Route::put('/{id}', [VisiteController::class, 'update']);
    Route::delete('/{id}', [VisiteController::class, 'destroy']);
    Route::get('/patient/{patientId}', [VisiteController::class, 'getByPatient']);
});



// Routes pour la gestion de l'authentification
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']); // Déconnexion
Route::post('/loginbycard', [AuthController::class, 'loginByCard']);


use App\Http\Controllers\GoogleAuthController;

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
