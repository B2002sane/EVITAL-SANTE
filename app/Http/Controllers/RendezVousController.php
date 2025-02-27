<?php

namespace App\Http\Controllers;


use App\Models\RendezVous;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\RendezVousNotification;    

class RendezVousController extends Controller
{
    /**
     * Afficher tous les rendez-vous
     */
    public function index()
    {
        $rendezVous = RendezVous::with(['patient', 'medecin'])->get();
        return response()->json(['rendezVous' => $rendezVous]);
    }





    /**
     * Créer un nouveau rendez-vous
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patientId' => 'required|exists:mongodb.utilisateurs,_id',
            'medecinId' => 'required|exists:mongodb.utilisateurs,_id',
            'date' => 'required|date',
            'motif' => 'required|string',
            'status' => 'sometimes|string|in:en_attente,confirme,annule,termine'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // // Vérifier si le médecin est disponible à cette date
        // $existingRdv = RendezVous::where('medecinId', $request->medecinId)
        //     ->where('date', $request->date)
        //     ->where('status', '!=', 'annule')
        //     ->first();

        // if ($existingRdv) {
        //     return response()->json([
        //         'message' => 'Le médecin a déjà un rendez-vous à cette date'
        //     ], 422);
        // }

        $rendezVous = RendezVous::create($request->all());


        $rendezVous->load(['patient', 'medecin']); // Charger explicitement les relations

        // Envoyer un email au patient
        Mail::to($rendezVous->patient->email)->send(new RendezVousNotification($rendezVous));
            // Envoyer un email au patient
       // Mail::to($rendezVous->patient->email)->send(new RendezVousNotification($rendezVous));

        return response()->json(['rendezVous' => $rendezVous], 201);
    }





    /**
     * Afficher un rendez-vous spécifique
     */
    public function show($id)
    {
        $rendezVous = RendezVous::with(['patient', 'medecin'])->find($id);
        
        if (!$rendezVous) {
            return response()->json(['message' => 'Rendez-vous non trouvé'], 404);
        }

        return response()->json(['rendezVous' => $rendezVous]);
    }

    /**
     * Mettre à jour un rendez-vous
     */
    public function update(Request $request, $id)
    {
        $rendezVous = RendezVous::find($id);

        if (!$rendezVous) {
            return response()->json(['message' => 'Rendez-vous non trouvé'], 404);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'motif' => 'sometimes|string',
            'status' => 'sometimes|string|in:en_attente,confirme,annule,termine'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // // Si la date est modifiée, vérifier la disponibilité du médecin
        // if ($request->has('date') && $request->date !== $rendezVous->date) {
        //     $existingRdv = RendezVous::where('medecinId', $rendezVous->medecinId)
        //         ->where('date', $request->date)
        //         ->where('status', '!=', 'annule')
        //         ->where('_id', '!=', $id)
        //         ->first();

        //     if ($existingRdv) {
        //         return response()->json([
        //             'message' => 'Le médecin a déjà un rendez-vous à cette date'
        //         ], 422);
        //     }
        // }

        $rendezVous->update($request->all());
        return response()->json(['rendezVous' => $rendezVous]);
    }

    /**
     * Supprimer un rendez-vous
     */
    public function destroy($id)
    {
        $rendezVous = RendezVous::find($id);
        
        if (!$rendezVous) {
            return response()->json(['message' => 'Rendez-vous non trouvé'], 404);
        }

        $rendezVous->delete();
        return response()->json(['message' => 'Rendez-vous supprimé avec succès']);
    }

    /**
     * Récupérer les rendez-vous d'un patient
     */
    public function getPatientRendezVous($patientId)
    {
        $rendezVous = RendezVous::with(['medecin'])
            ->where('patientId', $patientId)
            ->get();

        return response()->json(['rendezVous' => $rendezVous]);
    }

    /**
     * Récupérer les rendez-vous d'un médecin
     */
    public function getMedecinRendezVous($medecinId)
    {
        $rendezVous = RendezVous::with(['patient'])
            ->where('medecinId', $medecinId)
            ->get();

        return response()->json(['rendezVous' => $rendezVous]);
    }
}
