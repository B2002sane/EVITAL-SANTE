import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Lit {
  numero: number;
  occupe: boolean;
  patientId: string | null;
}

export interface Patient {
  _id: string;
  nom: string;
  prenom: string;
}

export interface Chambre {
  _id: string;
  numero: string;
  disponible: boolean;
  nombreLits: number;
  lits: Lit[];
  patients?: Patient[];
}

export interface ChambreFormData {
  numero: string;
  nombreLits?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GestionChambreService {
  private apiUrl = 'http://localhost:8000/api/chambres'; // Adaptez cette URL à votre backend

  constructor(private http: HttpClient) { }

  // Obtenir toutes les chambres
  getChambres(): Observable<Chambre[]> {
    return this.http.get<{chambres: Chambre[]}>(this.apiUrl)
      .pipe(
        map(response => response.chambres)
      );
  }

  // Obtenir une chambre spécifique
  getChambre(numero: string): Observable<Chambre> {
    return this.http.get<{chambre: Chambre}>(`${this.apiUrl}/${numero}`)
      .pipe(
        map(response => response.chambre)
      );
  }

  // Créer une nouvelle chambre
  createChambre(chambreData: ChambreFormData): Observable<Chambre> {
    return this.http.post<{chambre: Chambre}>(this.apiUrl, chambreData)
      .pipe(
        map(response => response.chambre)
      );
  }

  // Mettre à jour une chambre
  updateChambre(numero: string, chambreData: Partial<ChambreFormData>): Observable<Chambre> {
    return this.http.put<{chambre: Chambre}>(`${this.apiUrl}/${numero}`, chambreData)
      .pipe(
        map(response => response.chambre)
      );
  }

  // Supprimer une chambre
  deleteChambre(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Obtenir le statut d'occupation
  getStatutOccupation(numero: string): Observable<{
    chambre: string, 
    nombreTotal: number, 
    litsOccupes: number, 
    litsDisponibles: number, 
    disponible: boolean, 
    patients: Patient[]
  }> {
    return this.http.get<{
      chambre: string, 
      nombreTotal: number, 
      litsOccupes: number, 
      litsDisponibles: number, 
      disponible: boolean, 
      patients: Patient[]
    }>(`${this.apiUrl}/${numero}/statut`);
  }

  // Assigner un lit à un patient
  assignerLit(chambreNumero: string, patientId: string, numeroLit: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${chambreNumero}/assigner-lit`, {
      patientId,
      numeroLit
    });
  }

  // Libérer un lit
  libererLit(chambreNumero: string, numeroLit: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${chambreNumero}/liberer-lit`, {
      numeroLit
    });
  }
}