<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class DossierMedical extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'dossiers_medicaux';

    protected $fillable = [
        'idDossier',
        'poids',
        'prescriptions',
        'patientId', //  champ pour lier à un patient
    ];

    // Relation avec le modèle Utilisateur (patient)
    public function patient()
    {
        return $this->belongsTo(Utilisateur::class, 'patientId');
    }

     // Relation avec les constantes vitales
     public function constantesVitales()
     {
         return $this->hasMany(ConstanteVitale::class, 'dossierMedicalId');
     }
 
     // Relation avec les rendez-vous
     public function rendezVous()
     {
         return $this->hasMany(RendezVous::class, 'dossierMedicalId');
     }
         
}

