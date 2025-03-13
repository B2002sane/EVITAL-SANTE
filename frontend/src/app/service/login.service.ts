import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';



  // Gestion du succès d'authentification
  interface User {
    id: number;
    nom: string;
    prenom: string;
    role: string;
  }
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:8000/api'; // Remplacez par l'URL de votre API
  public socket: Socket;

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

    // Initialiser la connexion Socket.IO
    this.socket = io('http://localhost:5000');
    this.listenForRfidEvents();
  }

  // Écouter les événements RFID
  private listenForRfidEvents() {
    this.socket.on('card_uid', (uid: string) => {
      console.log('UID reçu:', uid);
      // Nous ne faisons rien ici, le composant de login écoutera également cet événement
    });
  }

  // Vérifier si l'email existe dans la base de données
  checkEmailExists(email: string): Observable<boolean> {
    if (!email || email.trim() === '') {
      return of(false);
    }

    return this.http.post<{ exists: boolean }>(`${this.apiUrl}/check-email`, { email })
      .pipe(
        map(response => response.exists),
        catchError(error => {
          console.error('Erreur lors de la vérification de l\'email:', error);
          return of(false);
        })
      );
  }

// Connexion avec email et mot de passe
login(email: string, password: string): Observable<{
  message: string;
  token: string;
  user?: User; // Rendre 'user' optionnel si l'API ne le retourne pas toujours
  status?: boolean;
  //data?: any;
}> {
  return this.http.post<{
    message: string;
    token: string;
    user?: User; // Assurez-vous que 'user' est optionnel ici aussi
    status?: boolean;
    //data?: any;
  }>(`${this.apiUrl}/login`, { email, password })
    .pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
}


  // Connexion avec carte RFID
  loginbycard(codeRfid: string): Observable<{
    message: string;
    token: string;
    user?: {
      id: number;
      nom: string;
      prenom: string;
      role: string;
    }
  }> {
    return this.http.post<{
      message: string;
      token: string;
      user?: {
        id: number;
        nom: string;
        prenom: string;
        role: string;
      }
    }>(`${this.apiUrl}/loginbycard`, { codeRfid })
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  // Déconnexion
  logout(): Observable<{
    status: boolean;
    message: string;
  }> {
    const headers = {
      'Authorization': `Bearer ${this.getToken()}`
    };

    return this.http.post<{
      status: boolean;
      message: string;
    }>(`${this.apiUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
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
    user?: User;
    data?: User;
  }): void {
    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      const user = response.user || response.data;
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }
    }
  }

    // Méthode pour envoyer le lien de réinitialisation de mot de passe
    sendPasswordResetLink(email: string): Observable<{message: string}> {
      return this.http.post<{message: string}>(`${this.apiUrl}/forgot`, { email })
        .pipe(
          catchError(this.handleError)
        );
    }
  
    // Méthode pour réinitialiser le mot de passe
    resetPassword(data: {
      email: string, 
      token: string, 
      password: string, 
      password_confirmation: string
    }): Observable<{message: string}> {
      return this.http.post<{message: string}>(`${this.apiUrl}/reset`, data)
        .pipe(
          catchError(this.handleError)
        );
    }
  

  // Connexion avec vérification de l'email
  loginWithEmailCheck(email: string, password: string): Observable<{
    message: string;
    token: string;
    user?: {
      id: number;
      nom: string;
      prenom: string;
      role: string;
    };
  }> {
    return this.checkEmailExists(email).pipe(
      switchMap(exists => {
        if (!exists) {
          return throwError(() => ({
            status: 401,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'Cet email n\'existe pas dans notre système.'
            }
          }));
        }
        return this.login(email, password);
      })
    );
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue lors de la connexion';
    let errorCode = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      if (error.status === 401) {
        if (error.error && error.error.code) {
          errorCode = error.error.code;
        } else {
          errorCode = 'INVALID_CREDENTIALS';
        }
      }
    }

    return throwError(() => ({
      message: errorMessage,
      code: errorCode,
      status: error.status
    }));
  }
}