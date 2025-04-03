import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DossierMedicalService {
 
  private apiUrl = 'http://localhost:8000/api/utilisateurs';

  constructor(private http: HttpClient) { }

  // Créer un dossier médical
  createDossierMedical(patientId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/patients/${patientId}/dossiers-medicaux`, data);
  }

  // Mettre à jour un dossier médical
  updateDossierMedical(patientId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/dossiers-medicaux/${patientId}`, data);
  }

  // Afficher un dossier médical
  getDossierMedical(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/dossiers-medicaux/${patientId}`);
  }

  // Ajouter des constantes vitales
  addConstanteVitale(patientId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/dossiers-medicaux/${patientId}/constantes-vitales`, data);
  }

  // Ajouter un rendez-vous
  /*addRendezVous(patientId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/dossiers-medicaux/${patientId}/rendez-vous`, data);
  }*/
}