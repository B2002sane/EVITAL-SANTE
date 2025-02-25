<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class ConstanteVitale extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'constantes_vitales';

    protected $fillable = [
        'idConstante',
        'frequencyCardiaque',
        'temperatureCorporelle',
        'dossierMedicalId', // Champ pour lier à un dossier médical
    ];

   // Relation avec le modèle DossierMedical
   public function dossierMedical()
   {
       return $this->belongsTo(DossierMedical::class, 'dossierMedicalId');
   }
}
