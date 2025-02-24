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
        Schema::connection('mongodb')->create('demandesDon', function (Blueprint $table) {
            $table->id();
            $table->string('medecinId');
            $table->string('groupeSanguin');
            $table->dateTime('dateDemande');
            $table->string('status')->default('EN_COURS'); // EN_COURS, ACCEPTEE, TERMINEE, ANNULEE
            $table->string('donneurId')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('demandesDon');
    }
};
