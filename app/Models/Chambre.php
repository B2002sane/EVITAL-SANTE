<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Chambre extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'chambres';

    protected $fillable = [
        'numero',          // Numéro de la chambre
        'disponible',      // État de disponibilité de la chambre
        'nombreLits',      // Nombre total de lits dans la chambre
        'lits'            // Array des lits avec leur statut
    ];

    protected $attributes = [
        'disponible' => true,
        'lits' => []       // Initialisé comme un tableau vide
    ];

  
    // Obtenir tous les patients hospitalisés dans cette chambre
    public function patients()
    {
        return $this->hasMany(Utilisateur::class, 'chambreId')
                    ->where('hospitalisation', true)
                    ->where('role', 'patient');
    }


    // Méthode pour vérifier si la chambre a des lits disponibles
    public function hasLitsDisponibles()
    {
        return collect($this->lits)->contains('occupe', false);
    }

    // Méthode pour obtenir le nombre de lits disponibles
    public function nombreLitsDisponibles()
    {
        return collect($this->lits)->where('occupe', false)->count();
    }


    // Méthode pour obtenir le nombre de lits occupés
    public function nombreLitsOccupes()
    {
        return collect($this->lits)->where('occupe', true)->count();
    }

    
    // Méthode pour initialiser les lits de la chambre
    public function initialiserLits($nombre)
    {
        $lits = [];
        for ($i = 1; $i <= $nombre; $i++) {
            $lits[] = [
                'numero' => $i,
                'occupe' => false,
                'patientId' => null
            ];
        }
        $this->lits = $lits;
        $this->nombreLits = $nombre;
        $this->save();
    }

    // Méthode pour assigner un lit à un patient
    public function assignerLit($patientId, $numeroLit)
    {
        $lits = $this->lits;
        $litIndex = $numeroLit - 1;

        if (isset($lits[$litIndex]) && !$lits[$litIndex]['occupe']) {
            $lits[$litIndex]['occupe'] = true;
            $lits[$litIndex]['patientId'] = $patientId;
            $this->lits = $lits;
            
            // Mettre à jour la disponibilité de la chambre
            $this->disponible = $this->hasLitsDisponibles();
            $this->save();
            return true;
        }
        return false;
    }

    // Méthode pour libérer un lit
    public function libererLit($numeroLit)
    {
        $lits = $this->lits;
        $litIndex = $numeroLit - 1;

        if (isset($lits[$litIndex]) && $lits[$litIndex]['occupe']) {
            $lits[$litIndex]['occupe'] = false;
            $lits[$litIndex]['patientId'] = null;
            $this->lits = $lits;
            
            // Mettre à jour la disponibilité de la chambre
            $this->disponible = true;
            $this->save();
            return true;
        }
        return false;
    }
}