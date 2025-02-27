<?php

namespace App\Http\Controllers;

use App\Models\ConstanteVitale;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConstanteVitaleController extends Controller
{
    // Ajouter des constantes vitales à un patient (sans dossier médical)
    public function addConstanteForPatient(Request $request, $patientId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'frequencyCardiaque' => 'required|integer',
                'temperatureCorporelle' => 'required|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['patientId'] = $patientId;

            $constanteVitale = ConstanteVitale::create($data);

            return response()->json([
                'status' => true,
                'message' => 'Constante vitale enregistrée avec succès',
                'data' => $constanteVitale
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Une erreur est survenue lors de l\'enregistrement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Ajouter des constantes vitales à un dossier médical
    public function addConstanteForDossierMedical(Request $request, $dossierMedicalId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'frequencyCardiaque' => 'required|integer',
                'temperatureCorporelle' => 'required|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            $data['dossierMedicalId'] = $dossierMedicalId;

            $constanteVitale = ConstanteVitale::create($data);

            return response()->json([
                'status' => true,
                'message' => 'Constante vitale enregistrée avec succès',
                'data' => $constanteVitale
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Une erreur est survenue lors de l\'enregistrement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}