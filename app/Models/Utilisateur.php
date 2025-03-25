<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Auth\Authenticatable; // Trait
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract; // Interface
use Tymon\JWTAuth\Contracts\JWTSubject; // Interface pour JWT

class Utilisateur extends Model implements AuthenticatableContract, JWTSubject
{
    use Authenticatable; // Utilisation du trait

    protected $connection = 'mongodb';
    protected $collection = 'utilisateurs';

    protected $fillable = [
        'nom',
        'prenom',
        'telephone',
        'email',
        'password',
        'role',
        'genre',
        'archive',
        'matricule',
        'photo',
        'status',
        'adresse',

        # spécifique aux patients
        'dateNaissance',
        'groupeSanguin',
        'categorie',
        'hospitalisation',
        'poids',

        # spécifique aux médecins et médecins-chefs
        'codeRfid',

        # spécifique aux donneurs
        'dernierDon',
        'statusDonneur'
    ];

    protected $hidden = ['password'];

    protected $attributes = [
        'hospitalisation' => false,
        'archive' => false,
        'status' => true,
    ];

    // Relations
    public function dossierMedical()
    {
        return $this->hasOne(DossierMedical::class, 'patientId');
    }

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'patientId');
    }

    public function rendezVousMedecin()
    {
        return $this->hasMany(RendezVous::class, 'medecinId');
    }

    public function chambre()
    {
        return $this->belongsTo(Chambre::class, 'chambreId');
    }

    public function demandesDonsCreees()
    {
        return $this->hasMany(DemandeDon::class, 'medecinId');
    }

    public function demandesDonsAcceptees()
    {
        return $this->hasMany(DemandeDon::class, 'donneurId');
    }

    // Relation pour récupérer les constantes vitales associées à un patient
    public function constantesVitales()
    {
        return $this->hasMany(ConstanteVitale::class, 'patientId');
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}