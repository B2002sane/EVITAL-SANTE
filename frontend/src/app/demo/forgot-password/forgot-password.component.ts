// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [LoginService],
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  token: string = '';
  password: string = '';
  passwordConfirmation: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showPasswordConfirmation: boolean = false;
  passwordError: string = '';
  passwordConfirmationError: string = '';
  serverError: string = '';
  resetSuccess: boolean = false;
  resetMessage: string = '';

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public loginService: LoginService
  ) {}

  ngOnInit(): void {
    // Récupérer l'email et le token depuis les paramètres d'URL
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      // Si l'email ou le token est manquant, afficher une erreur
      if (!this.email || !this.token) {
        this.serverError = 'Lien de réinitialisation invalide. Veuillez demander un nouveau lien.';
      }
    });
  }

  // Valider le mot de passe
  validatePassword(): void {
    this.passwordError = '';
    this.passwordConfirmationError = '';
    
    if (!this.password) {
      this.passwordError = 'Le mot de passe est requis';
      return;
    }
    
    if (this.password.length < 8) {
      this.passwordError = 'Le mot de passe doit contenir au moins 8 caractères';
      return;
    }
    
    // Vérifier que le mot de passe contient au moins une lettre majuscule, une lettre minuscule et un chiffre
    const hasUpperCase = /[A-Z]/.test(this.password);
    const hasLowerCase = /[a-z]/.test(this.password);
    const hasDigit = /\d/.test(this.password);
    
    if (!hasUpperCase || !hasLowerCase || !hasDigit) {
      this.passwordError = 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre';
      return;
    }
    
    // Vérifier que les mots de passe correspondent
    if (this.password !== this.passwordConfirmation) {
      this.passwordConfirmationError = 'Les mots de passe ne correspondent pas';
    }
  }

  // Méthode pour réinitialiser le mot de passe
  resetPassword(): void {
    // Valider les champs
    this.validatePassword();
    
    // Si des erreurs existent, ne pas continuer
    if (this.passwordError || this.passwordConfirmationError) {
      return;
    }
    
    this.isLoading = true;
    this.serverError = '';
    
    // Utiliser la méthode du service
    this.loginService.resetPassword({
      email: this.email,
      token: this.token,
      password: this.password,
      password_confirmation: this.passwordConfirmation
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.resetSuccess = true;
        this.resetMessage = response.message || 'Votre mot de passe a été réinitialisé avec succès.';
      },
      error: (error) => {
        this.isLoading = false;
        this.resetSuccess = false;
        this.serverError = error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.';
      }
    });
  }

  // Méthode pour basculer la visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Méthode pour basculer la visibilité de la confirmation du mot de passe
  togglePasswordConfirmationVisibility(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

  // Méthode pour rediriger vers la page de connexion
  goToLogin(): void {
    this.router.navigate(['login'], {
      queryParams: { error: 'Réinitialisation du mot de passe échouée' }
    });
}
}