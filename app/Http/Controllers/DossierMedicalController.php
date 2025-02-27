<?php

namespace App\Http\Controllers;

use App\Models\DossierMedical;
use App\Models\ConstanteVitale;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DossierMedicalController extends Controller
{
    // Créer un dossier médical
    public function create(Request $request, $patientId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'poids' => 'required|integer',
                'prescriptions' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();
            $data['patientId'] = $patientId;

            $dossierMedical = DossierMedical::create($data);

            return response()->json(['status' => true, 'message' => 'Dossier médical enregistré avec succès', 'data' => $dossierMedical], 201);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Une erreur est survenue lors de l\'enregistrement', 'error' => $e->getMessage()], 500);
        }
    }

    // Mettre à jour un dossier médical
    public function update(Request $request, $id)
    {
        try {
            $dossierMedical = DossierMedical::find($id);

            if (!$dossierMedical) {
                return response()->json(['status' => false, 'message' => 'Dossier médical non trouvé'], 404);
            }

            $validator = Validator::make($request->all(), [
                'poids' => 'integer',
                'prescriptions' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();
            $dossierMedical->update($data);

            return response()->json(['status' => true, 'message' => 'Dossier médical mis à jour avec succès', 'data' => $dossierMedical], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Une erreur est survenue lors de la mise à jour', 'error' => $e->getMessage()], 500);
        }
    }

    // Ajouter des constantes vitales
    public function addConstanteVitale(Request $request, $dossierMedicalId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'frequencyCardiaque' => 'required|integer',
                'temperatureCorporelle' => 'required|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();
            $data['dossierMedicalId'] = $dossierMedicalId;

            $constanteVitale = ConstanteVitale::create($data);

            return response()->json(['status' => true, 'message' => 'Constante vitale enregistrée avec succès', 'data' => $constanteVitale], 201);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Une erreur est survenue lors de l\'enregistrement', 'error' => $e->getMessage()], 500);
        }
    }

   
    // Ajouter un rendez-vous
    public function addRendezVous(Request $request, $dossierMedicalId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'patientId' => 'required|exists:mongodb.utilisateurs,_id',
                'medecinId' => 'required|exists:mongodb.utilisateurs,_id',
                'date' => 'required|date',
                'motif' => 'required|string',
                'status' => 'sometimes|string|in:en_attente,confirme,annule,termine'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();
            $data['dossierMedicalId'] = $dossierMedicalId;

            $rendezVous = RendezVous::create($data);

            return response()->json(['status' => true, 'message' => 'Rendez-vous enregistré avec succès', 'data' => $rendezVous], 201);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Une erreur est survenue lors de l\'enregistrement', 'error' => $e->getMessage()], 500);
        }
    }
}