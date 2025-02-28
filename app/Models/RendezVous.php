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
        'creePar'
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
}