import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,  tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { DossierMedicalService } from './dossier-medical.service'; // Assurez-vous d'importer le service DossierMedicalService

interface Statistiques {
  total_patients: number;
  total_donneurs: number;
  total_medecins: number;
  total_medecins_chef: number;
  total_utilisateurs: number;
}

interface ApiResponse {
  status: boolean;
  message: string;
  statistiques: Statistiques;
  utilisateurs: Utilisateur[];
  data: Utilisateur;
}

export interface Utilisateur {
medecinTraitant: any;
contactUrgence: any;
dernierRdv: any;
  actif: boolean;
  dateCreation: boolean;
  status: Utilisateur;
  data: Utilisateur;
  id?: string;
  nom: string;
  prenom: string;
  telephone: string;
  matricule: string;
  adresse: string;
  email: string;
  password?: string;
  role: 'PATIENT' | 'MEDECIN' | 'MEDECIN_CHEF' | 'DONNEUR' | 'INFIRMIER';
  genre: 'HOMME' | 'FEMME';
  photo?: string;
  dateNaissance?: string;
  groupeSanguin?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  categorie?: 'FEMME_ENCEINTE' | 'PERSONNE_AGEE' | 'MALADE_CHRONIQUE' | 'ENFANT' | 'AUTRE';
  poids?: number;
  codeRfid?: string;
  archive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8000/api/utilisateurs';

  constructor(private http: HttpClient, public dossierMedicalService: DossierMedicalService) {}

  /** Récupérer tous les utilisateurs */
  getUtilisateurs(): Observable<ApiResponse[]> {
    return this.http.get<ApiResponse[]>(this.apiUrl);
  }

  /** Récupérer les utilisateurs par rôle */
  getUtilisateursParRoles(roles: string[]): Observable<Utilisateur[]> {
    const rolesQuery = roles.join(',');
    return this.http.get<{ data: Utilisateur[] }>(`${this.apiUrl}/?role=${rolesQuery}`).pipe(
      map(response => response.data)
    );
  }

  /** Récupérer tous les patients */
  getPatients(): Observable<Utilisateur[]> {
    return this.http.get<{ data: Utilisateur[] }>(`${this.apiUrl}?role=PATIENT`).pipe(
      map(response => response.data)
    );
  }

  /** Récupérer un utilisateur par ID */
  getUtilisateurById(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }



  /** Récupérer un utilisateur par ID */
  getUtilisateurByIdEdit(id: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }





  /** Créer un nouvel utilisateur avec dossier médical (pour les patients) */

createUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {

  // Création de l'utilisateur via l'API
  return this.http.post<any>(this.apiUrl, utilisateur).pipe(
    map(response => {
      // Le contrôleur backend s'occupe maintenant de la création du dossier médical
      // pour les patients, donc on peut simplement retourner la réponse
      return response.data;
    }),
    // Log pour débogage
    tap(result => console.log('Utilisateur créé:', result))
  );
}




  /** Mettre à jour un utilisateur */
  updateUtilisateur(id: string, utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
  }

  /** Supprimer un utilisateur (suppression logique) */
  deleteUtilisateur(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /** Supprimer plusieurs utilisateurs (suppression logique) */
  deleteMultipleUtilisateurs(ids: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/destroy-multiple`, { ids });
  }
}
