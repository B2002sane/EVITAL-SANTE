<?php

namespace App\Http\Controllers;


use App\Models\DemandeDon;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class DemandeDonController extends Controller
{
    /**
     * Vérifier si l'utilisateur est un médecin
     */
    private function verifierMedecin($medecinId)
    {
        $medecin = Utilisateur::find($medecinId);
        if (!$medecin || $medecin->role !== 'MEDECIN') {
            return response()->json(['message' => 'Action non autorisée. Seuls les médecins peuvent gérer les demandes de don.'], 403);
        }
        return null;
    }

    /**
     * Afficher toutes les demandes de don
     */
    public function index($medecinId)
    {
        $error = $this->verifierMedecin($medecinId);
        if ($error) return $error;

        $demandesDon = DemandeDon::with(['medecin', 'donneur'])
            ->where('medecinId', $medecinId)
            ->get();

        return response()->json(['demandesDon' => $demandesDon]);
    }

    /**
     * Créer une nouvelle demande de don
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'medecinId' => 'required|exists:utilisateurs,_id',
            'groupeSanguin' => 'required|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'dateDemande' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $error = $this->verifierMedecin($request->medecinId);
        if ($error) return $error;

        $demandeDon = DemandeDon::create([
            'medecinId' => $request->medecinId,
            'groupeSanguin' => $request->groupeSanguin,
            'dateDemande' => $request->dateDemande,
            'status' => 'EN_COURS'
        ]);

        return response()->json(['demandeDon' => $demandeDon], 201);
    }

    /**
     * Afficher une demande de don spécifique
     */
    public function show($id)
    {
        $demandeDon = DemandeDon::with(['medecin', 'donneur'])->find($id);

        if (!$demandeDon) {
            return response()->json(['message' => 'Demande de don non trouvée'], 404);
        }

        return response()->json(['demandeDon' => $demandeDon]);
    }

    /**
     * Mettre à jour une demande de don
     */
    public function update(Request $request, $id)
    {
        $demandeDon = DemandeDon::find($id);

        if (!$demandeDon) {
            return response()->json(['message' => 'Demande de don non trouvée'], 404);
        }

        $error = $this->verifierMedecin($demandeDon->medecinId);
        if ($error) return $error;

        $validator = Validator::make($request->all(), [
            'groupeSanguin' => 'sometimes|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'dateDemande' => 'sometimes|date',
            'status' => 'sometimes|string|in:EN_COURS,TERMINEE,ANNULEE'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($demandeDon->donneurId && $request->has('status') && $request->status === 'EN_COURS') {
            return response()->json(['message' => 'Impossible de remettre en cours une demande déjà acceptée'], 422);
        }

        $demandeDon->update($request->all());
        return response()->json(['demandeDon' => $demandeDon]);
    }

    /**
     * Supprimer une demande de don
     */
    public function destroy($id)
    {
        $demandeDon = DemandeDon::find($id);

        if (!$demandeDon) {
            return response()->json(['message' => 'Demande de don non trouvée'], 404);
        }

        $error = $this->verifierMedecin($demandeDon->medecinId);
        if ($error) return $error;

        if ($demandeDon->donneurId) {
            return response()->json(['message' => 'Impossible de supprimer une demande déjà acceptée'], 422);
        }

        $demandeDon->delete();
        return response()->json(['message' => 'Demande de don supprimée avec succès']);
    }

    /**
     * Lister toutes les demandes de don disponibles pour les donneurs
     */
    public function demandesDisponibles($groupeSanguin = null)
    {
        $query = DemandeDon::with('medecin')
            ->where('status', 'EN_COURS')
            ->whereNull('donneurId');

        if ($groupeSanguin) {
            $query->where('groupeSanguin', $groupeSanguin);
        }

        $demandesDon = $query->get();
        return response()->json(['demandesDon' => $demandesDon]);
    }

    /**
     * Accepter une demande de don (pour les donneurs)
     */
    public function accepterDemande(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'donneurId' => 'required|exists:utilisateurs,_id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $donneur = Utilisateur::find($request->donneurId);
        if (!$donneur || $donneur->role !== 'DONNEUR') {
            return response()->json(['message' => 'Utilisateur non autorisé ou non trouvé'], 403);
        }

        $demandeDon = DemandeDon::find($id);

        if (!$demandeDon || !$demandeDon->peutEtreAcceptee()) {
            return response()->json(['message' => 'Demande de don non disponible'], 404);
        }

        if ($demandeDon->groupeSanguin !== $donneur->groupeSanguin) {
            return response()->json(['message' => 'Groupe sanguin incompatible'], 422);
        }

        // Vérifier si le donneur a fait un don récemment (dans les 3 mois)
        if ($donneur->dernierDon) {
            $dernierDon = Carbon::parse($donneur->dernierDon);
            if ($dernierDon->diffInMonths(Carbon::now()) < 3) {
                return response()->json(['message' => 'Vous devez attendre 3 mois entre chaque don'], 422);
            }
        }

        $demandeDon->update([
            'donneurId' => $donneur->_id,
            'status' => 'ACCEPTEE'
        ]);

        // Mettre à jour la date du dernier don
        $donneur->update(['dernierDon' => Carbon::now()]);

        return response()->json(['message' => 'Demande de don acceptée avec succès', 'demandeDon' => $demandeDon]);
    }
}
