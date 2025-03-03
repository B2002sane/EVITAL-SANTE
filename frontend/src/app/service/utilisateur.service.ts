import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Utilisateur {
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

  constructor(private http: HttpClient) {}

  /** Récupérer tous les utilisateurs */
  getUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }


  /** Récupérer les utilisateurs par rôle */
getUtilisateursParRoles(roles: string[]): Observable<Utilisateur[]> {
  const rolesQuery = roles.join(','); // Convertir le tableau en une chaîne séparée par des virgules
  return this.http.get<{ data: Utilisateur[] }>(`${this.apiUrl}/?role=${rolesQuery}`).pipe(
    map(response => response.data) // Extraire "data"
  );
}


  /** Récupérer tous les patients */
  getPatients(): Observable<Utilisateur[]> {
    return this.http.get<{ data: Utilisateur[] }>(`${this.apiUrl}?role=PATIENT`).pipe(
      map(response => response.data) // Extraction de "data"
    );
  }


  /** Récupérer un utilisateur par ID */
  getUtilisateurById(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  /** Créer un nouvel utilisateur */
  createUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.apiUrl, utilisateur);
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
