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
        Schema::connection('mongodb')->create('rendezVous', function (Blueprint $table) {
            $table->id();
            $table->string('patientId');
            $table->string('medecinId');
            $table->dateTime('date');
            $table->string('motif');
            $table->string('status')->default('en_attente'); // en_attente, confirme, annule, termine
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('rendezVous');
    }
};
