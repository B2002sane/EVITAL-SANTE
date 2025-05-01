<?php
namespace App\Http\Controllers;

use App\Models\Visite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VisiteController extends Controller
{
    // ***********Lister les visites d'un dossier médical
    public function index($dossierMedicalId)
    {
        try {
            $visites = Visite::where('dossierMedicalId', $dossierMedicalId)->get();
            return response()->json([
                'status' => true,
                'message' => 'Liste des visites récupérée avec succès',
                'data' => $visites
            ]);
        } catch (\Exception $e) {
            return response()->json([
            'status' => false, 
            'message' => 'Erreur lors de la récupération des visites', 
            'error' => $e->getMessage()], 500);
        }
    }

    // *************Créer une nouvelle visite
    public function store(Request $request)
    {
        $rules = [
            'dossierMedicalId' => 'nullable|string',
            'patientId' => 'required|string',
            'medecinId' => 'required|string',
            'prescriptions' => 'nullable|array',
            'prescriptions.*.nom_medicament' => 'required|string',
            'prescriptions.*.frequence' => 'required|string',
        ];

        $messages = [
            'medecinId.required' => 'L\'ID du médecin est requis.',
            'patientId.required' => 'L\'ID du patient est requis.',
            'prescriptions.*.nom_medicament.required' => 'Le nom du médicament est requis pour chaque prescription.',
            'prescriptions.*.frequence.required' => 'La fréquence est requise pour chaque prescription.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $visite = Visite::create($validator->validated());

            return response()->json([
                'status' => true,
                'message' => 'Visite créée avec succès',
                'data' => $visite
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Erreur lors de la création de la visite', 
                'error' => $e->getMessage()], 500);
        }
    }







    // ***************Récupérer une seule visite
    public function show($id)
    {
        try {
            $visite = Visite::findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Visite récupérée avec succès',
                'data' => $visite
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Visite non trouvée', 
                'error' => $e->getMessage()], 404);
        }
    }






    // ****************Mettre à jour une visite
    public function update(Request $request, $id)
    {
        try {
            $visite = Visite::findOrFail($id);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Visite non trouvée', 'error' => $e->getMessage()], 404);
        }

        $rules = [
            'prescriptions' => 'nullable|array',
            'prescriptions.*.nom_medicament' => 'required|string',
            'prescriptions.*.frequence' => 'required|string',
        ];

        $messages = [
            'prescriptions.*.nom_medicament.required' => 'Le nom du médicament est requis pour chaque prescription.',
            'prescriptions.*.frequence.required' => 'La fréquence est requise pour chaque prescription.',
        ];

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $visite->update($validator->validated());

            return response()->json([
                'status' => true,
                'message' => 'Visite mise à jour avec succès',
                'data' => $visite
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Erreur lors de la mise à jour', 
                'error' => $e->getMessage()], 500);
        }
    }



    

    // **************Supprimer une visite
    public function destroy($id)
    {
        try {
            $visite = Visite::findOrFail($id);
            $visite->delete();

            return response()->json([
                'status' => true,
                'message' => 'Visite supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Erreur lors de la suppression', 'error' => $e->getMessage()], 500);
        }
    }


// **************Récupérer les visites d'un patient
        public function getByPatient($patientId)
    {
        $visites = Visite::where('patientId', $patientId)->with(['medecin'])->get();

        return response()->json([
            'status' => true,
            'message' => 'Liste des visites récupérée avec succès',
            'data' => $visites
        ]);
    }

}
