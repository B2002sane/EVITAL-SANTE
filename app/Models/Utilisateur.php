<?php

namespace App\Models;


use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Authenticatable as AuthenticatableTrait;
use Illuminate\Contracts\Auth\Authenticatable;
use MongoDB\Laravel\Eloquent\Model;

class Utilisateur extends Model
{

    use HasApiTokens, AuthenticatableTrait;
    
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
     public function dossiersMedicaux()
     {
         return $this->hasMany(DossierMedical::class, 'patientId');
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

}
