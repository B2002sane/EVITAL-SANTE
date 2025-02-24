<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class DemandeDon extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'demandesDon';

    protected $fillable = [
        'medecinId',
        'groupeSanguin',
        'dateDemande',
        'status',
        'donneurId'
    ];

    protected $attributes = [
        'status' => 'EN_COURS'
    ];

    // Relations
    public function medecin()
    {
        return $this->belongsTo(Utilisateur::class, 'medecinId');
    }

    public function donneur()
    {
        return $this->belongsTo(Utilisateur::class, 'donneurId');
    }


    // Vérifie si un donneur peut accepter la demande
    public function peutEtreAcceptee()
    {
        return $this->status === 'EN_COURS' && is_null($this->donneurId);
    }

}