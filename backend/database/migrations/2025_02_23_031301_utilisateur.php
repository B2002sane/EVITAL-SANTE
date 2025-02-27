<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('mongodb')->create('utilisateurs', function (Blueprint $collection) {
            $collection->id();
            $collection->string('nom');
            $collection->string('prenom');
            $collection->string('telephone')->unique();
            $collection->string('email')->unique();
            $collection->string('password');
            $collection->enum('role', ['PATIENT', 'MEDECIN', 'MEDECIN_CHEF', 'DONNEUR']);
            $collection->enum('genre', ['HOMME', 'FEMME']);
            $collection->boolean('archive')->default(false);
            $collection->string('matricule')->unique();
            $collection->string('photo')->nullable();
            $collection->boolean('status')->default(true);

            // Champs spécifiques aux patients
            $collection->date('dateNaissance')->nullable();
            $collection->enum('groupeSanguin', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
            $collection->enum('categorie', ['FEMME_ENCEINTE', 'PERSONNE_AGEE', 'MALADE_CHRONIQUE']);
            $collection->boolean('hospitalisation')->default(false);
            $collection->float('poids')->nullable();

            // Champs spécifiques aux médecins
            $collection->string('codeRfid')->nullable()->unique();

            // Champs spécifiques aux donneurs
            $collection->date('dernierDon')->nullable();
            $collection->boolean('statusDonneur')->default(true);

            $collection->timestamps();
            $collection->rememberToken();
            
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('utilisateurs');
    }
};
