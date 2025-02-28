import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../auth/login.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http'; // <-- Ajoutez cette ligne


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService], // Fournisseurs de services

})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private router: Router,
    public loginService: LoginService
  ) {}

  // Méthode pour gérer la connexion par email et mot de passe
  onLogin() {
    // Réinitialiser le message d'erreur
    this.errorMessage = '';
  
    // Validation côté client
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez saisir votre email et mot de passe';
      return;
    }
  
    this.isLoading = true;
  
    this.loginService.login(this.email, this.password).subscribe({
      next: (response: {
        message: string;
        token: string;
        user?: {
          id: number;
          nom: string;
          prenom: string;
          role: string;
        };
      }) => {
        this.isLoading = false;
  
        // Réinitialiser les champs du formulaire
        this.email = '';
        this.password = '';
  
        // Rediriger en fonction du rôle de l'utilisateur
        if (response.user?.role === 'MEDECIN_CHEF') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
  
        // Gestion des erreurs spécifiques
        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 500) {
          this.errorMessage = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
        } else {
          this.errorMessage = error.error.message || 'Une erreur est survenue lors de la connexion';
        }
      }
    });
  }

  /*
  // Méthode pour gérer la connexion par RFID
  onRfidLogin(event: Event) {
    event.preventDefault(); // Empêcher le comportement par défaut du lien
    this.isLoading = true;
    this.errorMessage = '';

    // Simuler un code RFID (à remplacer par la logique réelle)
    const rfidCode = '1234567890';

    this.loginService.loginbycard(rfidCode).subscribe({
      next: (response: {
        message: string;
        token: string;
        status?: boolean;
       data?: any;
      }) => {
        this.isLoading = false;
        // Rediriger vers le tableau de bord
        this.router.navigate(['/dashboard']);
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Erreur lors de la connexion par RFID';
      }
    });
  }
    */

  // Méthode pour basculer la visibilité du mot de passe
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}