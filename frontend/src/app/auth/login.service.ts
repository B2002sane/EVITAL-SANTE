// auth/login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:8000/api'; // Remplacez par l'URL de votre API
  
  private currentUserSubject = new BehaviorSubject<{
    id: number;
    nom: string;
    prenom: string;
    role: string;
  } | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'token';

  constructor(private http: HttpClient) {
    // Restaurer l'utilisateur depuis le stockage local si disponible
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Connexion avec email et mot de passe
  login(email: string, password: string): Observable<{
    message: string;
    token: string;
    user?: {
      id: number;
      nom: string;
      prenom: string;
      role: string;
    };
  }> {
    return this.http.post<{
      message: string;
      token: string;
      user?: {
        id: number;
        nom: string;
        prenom: string;
        role: string;
      };
    }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }
/*
  // Connexion avec carte RFID
  loginbycard(codeRfid: string): Observable<{
    message: string;
    token: string;
    status?: boolean;
    data?: any;
  }> {
    return this.http.post<{
      message: string;
      token: string;
      status?: boolean;
      data?: any;
    }>(`${this.apiUrl}/login-by-card`, { codeRfid })
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }
*/
  // Déconnexion
  logout(): Observable<{
    status: boolean;
    message: string;
  }> {
    // Ajout du token d'authentification dans les headers
    const headers = {
      'Authorization': `Bearer ${this.getToken()}`
    };

    return this.http.post<{
      status: boolean;
      message: string;
    }>(`${this.apiUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          // Supprimer les informations de l'utilisateur du stockage local
          localStorage.removeItem(this.tokenKey);
          localStorage.removeItem('current_user');
          this.currentUserSubject.next(null);
        }),
        catchError(this.handleError)
      );
  }

  // Récupérer l'utilisateur actuel
  getCurrentUser(): {
    id: number;
    nom: string;
    prenom: string;
    role: string;
  } | null {
    return this.currentUserSubject.value;
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Récupérer le token JWT
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Gestion du succès d'authentification
  private handleAuthSuccess(response: {
    message: string;
    token: string;
    user?: string;
    data?: string;
  }): void {
    if (response.token) {
      // Sauvegarder le token dans le stockage local
      localStorage.setItem(this.tokenKey, response.token);
      
      // Sauvegarder les informations de l'utilisateur
      const user = response.user || response.data;
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }
    }
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue lors de la connexion';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}