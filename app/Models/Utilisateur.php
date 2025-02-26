<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Auth\Authenticatable; // Ajoutez ce trait
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract; // Ajoutez cette interface

class Utilisateur extends Model implements JWTSubject, AuthenticatableContract
{
    use Authenticatable; // Utilisez ce trait
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

        # specifique au patients
        'dateNaissance',
        'groupeSanguin',
        'categorie',
        'hospitalisation',
        'poids',

        #specifique au medecin et medecin chef
        'codeRfid',

        #specifique au donneurs
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

 
    //  public function demandesDons()
    //  {
    //      return $this->hasMany(DemandeDon::class, 'donneurId');
    //  }

        public function demandesDonsCreees()
    {
        return $this->hasMany(DemandeDon::class, 'medecinId');
    }

    public function demandesDonsAcceptees()
    {
        return $this->hasMany(DemandeDon::class, 'donneurId');
    }


    //relation pour récupérer les constantes vitales associées à un patient:
    public function constantesVitales()
{
    return $this->hasMany(ConstanteVitale::class, 'patientId');
}



  public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

}
