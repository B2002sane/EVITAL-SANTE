<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Visite extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'visites';

    protected $fillable = [
        'dossierMedicalId',
        'patientId',
        'medecinId',
        'date',
        'prescriptions',
    ];

    protected $casts = [
        'prescriptions' => 'array',
        'date' => 'date',
    ];

    public function dossierMedical()
    {
        return $this->belongsTo(DossierMedical::class, 'dossierMedicalId');
    }


     // Relation avec le patient
     public function patient()
     {
         return $this->belongsTo(Utilisateur::class, 'patientId');
     }

    public function medecin()
    {
        return $this->belongsTo(Utilisateur::class, 'medecinId');
    }
}

