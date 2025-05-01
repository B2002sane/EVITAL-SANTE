<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class DossierMedical extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'dossiers_medicaux';

    protected $fillable = [
        'idDossier',
        'patientId',
        'allergies',
        'antecedents_medicaux',
    ];

    protected $casts = [
        'allergies' => 'array',
        'antecedents_medicaux' => 'array',
    ];

    // Relation avec le patient
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

    // Relation avec les visites
    public function visites()
    {
        return $this->hasMany(Visite::class, 'dossierMedicalId');
    }
}
