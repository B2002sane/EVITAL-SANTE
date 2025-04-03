import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DemandeDonService {
  private apiUrl = 'http://localhost:8000/api/demandes-don';

  constructor(private http: HttpClient) {}


  // Récupérer toutes les demandes de don
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Récupérer toutes les demandes de don d'un médecin
  getDemandesByMedecin(medecinId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/medecin/${medecinId}/demandes`);
  }

  // Récupérer une demande spécifique
  getDemandeById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle demande de don
  createDemande(demande: any): Observable<any> {
    return this.http.post(this.apiUrl, demande);
  }

  // Mettre à jour une demande de don
  updateDemande(id: string, demande: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, demande);
  }

  // Supprimer une demande de don
  deleteDemande(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Récupérer les demandes disponibles pour les donneurs (optionnel : filtrer par groupe sanguin)
  getDemandesDisponibles(groupeSanguin?: string): Observable<any> {
    const url = groupeSanguin ? `${this.apiUrl}-disponibles/${groupeSanguin}` : `${this.apiUrl}-disponibles`;
    return this.http.get(url);
  }

  // Accepter une demande de don
  accepterDemande(id: string, donneurId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/accepter`, { donneurId });
  }

  // Annuler une demande de don acceptée
  annulerDemande(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/annuler`, {});
  }
}