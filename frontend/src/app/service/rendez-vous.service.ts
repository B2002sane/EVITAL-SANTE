import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';





export interface RendezVous {
  _id?: string;
  patientId: string;
  medecinId: string;
  date: string;
  motif: string;
  status?: 'en_attente' | 'confirme' | 'annule' | 'termine';
  creePar?: 'patient' | 'medecin';
}





@Injectable({
  providedIn: 'root',
})
export class RendezVousService {
  private apiUrl = 'http://localhost:8000/api/rendez-vous';

  constructor(private http: HttpClient) {}

  /**
   * Cette méthode récupère tous les rendez-vous, avec une option pour filtrer par date.
   */
  getAll(date?: string): Observable<{ rendezVous: RendezVous[] }> {
    const url = date ? `${this.apiUrl}/date/${date}` : this.apiUrl;
    return this.http.get<{ rendezVous: RendezVous[] }>(url);
  }





  getById(id: string): Observable<{ rendezVous: RendezVous }> {
    return this.http.get<{ rendezVous: RendezVous }>(`${this.apiUrl}/${id}`);
  }




  /**
   * Cette méthode permet de créer un nouveau rendez-vous.
   */
  create(rendezVous: RendezVous): Observable<{ rendezVous: RendezVous }> {
    return this.http.post<{ rendezVous: RendezVous }>(this.apiUrl, rendezVous);
  }




  /**
   * Cette méthode permet à un patient de demander un rendez-vous.
   */
  requestAppointment(rendezVous: RendezVous): Observable<{ rendezVous: RendezVous, message: string }> {
    return this.http.post<{ rendezVous: RendezVous, message: string }>(`${this.apiUrl}/demander`, rendezVous);
  }




  update(id: string, rendezVous: Partial<RendezVous>): Observable<{ rendezVous: RendezVous }> {
    return this.http.put<{ rendezVous: RendezVous }>(`${this.apiUrl}/${id}`, rendezVous);
  }




  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }



  /**
   * Cette méthode récupère tous les rendez-vous d'un patient spécifique.
   */
  getByPatient(patientId: string): Observable<{ rendezVous: RendezVous[] }> {
    return this.http.get<{ rendezVous: RendezVous[] }>(`${this.apiUrl}/patient/${patientId}`);
  }




  getByMedecin(medecinId: string): Observable<{ rendezVous: RendezVous[] }> {
    return this.http.get<{ rendezVous: RendezVous[] }>(`${this.apiUrl}/medecin/${medecinId}`);
  }




  getPendingRequests(medecinId: string): Observable<{ demandes: RendezVous[] }> {
    return this.http.get<{ demandes: RendezVous[] }>(`${this.apiUrl}/attente/${medecinId}`);
  }





  /**
   * Cette méthode permet d'accepter une demande de rendez-vous.
   */
  acceptRequest(id: string): Observable<{ rendezVous: RendezVous, message: string }> {
    return this.http.put<{ rendezVous: RendezVous, message: string }>(`${this.apiUrl}/${id}/accepter`, {});
  }
}
