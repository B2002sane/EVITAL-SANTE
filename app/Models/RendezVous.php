<?php

namespace App\Models;


use MongoDB\Laravel\Eloquent\Model;

class RendezVous extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'rendezVous';

    protected $fillable = [
        'patientId',
        'medecinId',
        'date',
        'motif',
        'status',
        'dossierMedicalId', // Champ pour lier à un dossier médical

    ];



    // Relations
    public function patient()
    {
        return $this->belongsTo(Utilisateur::class, 'patientId');
    }

    public function medecin()
    {
        return $this->belongsTo(Utilisateur::class, 'medecinId');
    }

    # Relation avec le modelèle DossierMedical
    public function dossierMedical()
    {
        return $this->belongsTo(DossierMedical::class, 'dossierMedicalId');

    }
}