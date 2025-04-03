import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, tap} from 'rxjs';

// Types pour les patients
interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  sexe?: 'M' | 'F';
  hospitalisation: boolean;
  chambreId?: string | null;
  role?: string;
}

// Type pour les lits
interface Lit {
  numero: number;
  patientId?: string | null;
  occupé: boolean;
}

// Interface pour la chambre
interface Chambre {
  id?: string;
  numero: string;
  disponible: boolean;
  nombreLits: number;
  lits?: Lit[];
  patients?: Patient[];
  raison: string
}

// Interface pour les filtres de chambre
interface ChambreFiltre {
  disponible?: boolean;
  litsMin?: number;
}

// Interface pour le statut d'occupation
interface StatutOccupation {
  chambre: string;
  nombreTotalLits: number;
  litsOccupes: number;
  litsDisponibles: number;
  disponible: boolean;
  patients: Patient[];
}

@Injectable({
  providedIn: 'root'
})
export class GestionChambreService {
  private apiUrl = 'http://localhost:8000/api'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  // Récupérer toutes les chambres (avec filtres optionnels)
  getChambresList(filtres?: ChambreFiltre): Observable<{ chambres: Chambre[] }> {
    let params = new HttpParams();
    
    if (filtres) {
      if (filtres.disponible !== undefined) {
        params = params.set('disponible', filtres.disponible.toString());
      }
      if (filtres.litsMin) {
        params = params.set('litsMin', filtres.litsMin.toString());
      }
    }
    
    return this.http.get<{ chambres: Chambre[] }>(`${this.apiUrl}/chambres`, { params })
      .pipe(
        tap(response => {

          // Vérifier que chaque chambre a un ID
          response.chambres.forEach(chambre => {
            if (!chambre.id) {
              console.error('Chambre sans ID dans la réponse API:', chambre);
            }
          });
          console.log('Réponse API:', response);
        })
      );
  }

  // Créer une nouvelle chambre
  creerChambre(chambre: { numero: string, nombreLits: number }): Observable<{ chambre: Chambre }> {
    return this.http.post<{ chambre: Chambre }>(`${this.apiUrl}/chambres`, chambre);
  }



  // Obtenir les détails d'une chambre spécifique
  getDetailsChambre(id: string): Observable<{ chambre: Chambre }> {
    return this.http.get<{ chambre: Chambre }>(`${this.apiUrl}/chambres/${id}`);
  }



  // Mettre à jour une chambre
  mettreAJourChambre(id: string, chambre: Partial<Chambre>): Observable<{ chambre: Chambre }> {
    if (!id) {
      console.error('ID de chambre non défini dans mettreAJourChambre');
      // Vous pourriez choisir de retourner un Observable d'erreur ici
      return throwError(() => new Error('ID de chambre non défini'));
    }
    return this.http.put<{ chambre: Chambre }>(`${this.apiUrl}/chambres/${id}`, chambre);
  }



  // Supprimer une chambre
  supprimerChambre(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/chambres/${id}`);
  }



  // Obtenir les patients non hospitalisés
  getPatientsNonHospitalises(): Observable<{ patients: Patient[] }> {
    return this.http.get<{ patients: Patient[] }>(`${this.apiUrl}/patients/non-hospitalises`);
  }



  // Assigner un lit à un patient
  assignerLit(chambreId: string, patientId: string, numeroLit: number): Observable<{ message: string, chambre: Chambre }> {
    return this.http.post<{ message: string, chambre: Chambre }>(
      `${this.apiUrl}/chambres/${chambreId}/assigner-lit`,
      { patientId, numeroLit }
    );
  }


  
  // Libérer un lit
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  libererLit(chambreId: string, numeroLit: number, raison: string = 'Sortie standard'): Observable<{ message: string, chambre: Chambre }> {
    return this.http.post<{ message: string, chambre: Chambre }>(
      `${this.apiUrl}/chambres/${chambreId}/liberer-lit`,
      { numeroLit }
    );
  }

  // Obtenir les chambres disponibles
  getChambresDisponibles(): Observable<{ chambres: Chambre[] }> {
    return this.http.get<{ chambres: Chambre[] }>(`${this.apiUrl}/chambres-disponibles`);
  }

  

  // Obtenir le statut d'occupation d'une chambre
  getStatutOccupation(chambreId: string): Observable<StatutOccupation> {
    return this.http.get<StatutOccupation>(`${this.apiUrl}/chambres/${chambreId}/statut`);
  }
}