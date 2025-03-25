<?php

namespace App\Http\Controllers;

use App\Mail\ConfirmationRendezVousNotification;
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
        /**
     * Afficher tous les rendez-vous avec possibilité de filtrer par date
     */
    public function index(Request $request)
    {
        // Vérifier si un paramètre de date est présent dans la requête
        if ($request->has('date')) {
            $date = $request->query('date');
            $rendezVous = RendezVous::with(['patient', 'medecin'])
                ->where('date', $date)
                ->get();
        } else {
            // Si aucune date n'est spécifiée, récupérer tous les rendez-vous
            $rendezVous = RendezVous::with(['patient', 'medecin'])->get();
        }

        return response()->json(['rendezVous' => $rendezVous]);
    }

    //Afficher les rendez vous filtrer par date 
    public function indexByDate($date)
    {
        $rendezVous = RendezVous::with(['patient', 'medecin'])
            ->where('date', $date)
            ->get();

        return response()->json(['rendezVous' => $rendezVous]);
    }





   /**
     * Créer un nouveau rendez-vous (par un médecin)
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

        // Pour un rendez-vous créé par un médecin, on le marque comme confirmé directement
        $data = $request->all();
        if (!isset($data['status'])) {
            $data['status'] = 'confirme';
        }
        $data['creePar'] = 'medecin';

        $rendezVous = RendezVous::create($data);
        $rendezVous->load(['patient', 'medecin']);

        // Envoyer un email au patient
        
        Mail::to($rendezVous->patient->email)->send(new RendezVousNotification($rendezVous));

        return response()->json(['rendezVous' => $rendezVous], 201);
    }




     /**
     * Créer une demande de rendez-vous (par un patient)
     */
    public function demanderRendezVous(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patientId' => 'required|exists:mongodb.utilisateurs,_id',
            'medecinId' => 'required|exists:mongodb.utilisateurs,_id',
            'date' => 'required|date',
            'motif' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['status'] = 'en_attente';
        $data['creePar'] = 'patient';

        $rendezVous = RendezVous::create($data);
        $rendezVous->load(['patient', 'medecin']);

       

        return response()->json(['rendezVous' => $rendezVous, 'message' => 'Demande de rendez-vous envoyée avec succès'], 201);
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
     * Récupérer les rendez-vous d'un patient verifie d'abord si c'est un patient     */

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



    /**
     * Récupérer les demandes de rendez-vous en attente pour un médecin
     */
    public function getDemandesEnAttente($medecinId)
    {
        $rendezVous = RendezVous::with(['patient'])
            ->where('medecinId', $medecinId)
            ->where('status', 'en_attente')
            ->where('creePar', 'patient')
            ->get();

        return response()->json(['demandes' => $rendezVous]);
    }


    /**
     * Accepter une demande de rendez-vous
     */
    public function accepterDemande($id)
    {
        $rendezVous = RendezVous::with(['patient', 'medecin'])->find($id);
        
        if (!$rendezVous) {
            return response()->json(['message' => 'Demande de rendez-vous non trouvée'], 404);
        }

        if ($rendezVous->status !== 'en_attente') {
            return response()->json(['message' => 'Cette demande ne peut plus être acceptée'], 422);
        }

        $rendezVous->update(['status' => 'confirme']);
        
        

         // Envoyer un email de confirmation au patient
         Mail::to($rendezVous->patient->email)->send(new ConfirmationRendezVousNotification($rendezVous));

        return response()->json(['rendezVous' => $rendezVous, 'message' => 'Demande de rendez-vous acceptée']);
    }



}
