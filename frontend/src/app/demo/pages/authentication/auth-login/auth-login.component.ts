import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { LoginService } from '../../../../service/login.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss'],
  providers: [LoginService],
})
export class AuthLoginComponent implements OnDestroy {
  email: string = '';
  password: string = '';
  emailError: string = '';
  passwordError: string = '';
  serverError: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  // Variables pour le blocage après tentatives échouées
  failedAttempts: number = 0;
  isLocked: boolean = false;
  lockDuration: number = 30; // durée du blocage en secondes
  remainingTime: number = 0;
  lockTimerSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    public loginService: LoginService
  ) {
    // Restaurer l'état de blocage depuis le localStorage si disponible
    this.restoreLockState();

    // Écouter les événements RFID pour mettre à jour les champs du formulaire
    this.loginService.socket.on('card_uid', (uid: string) => {
      console.log('UID reçu:', uid);
      this.updateFormWithRfidData(uid);
    });
  }

  // Mettre à jour les champs du formulaire avec les données RFID
  updateFormWithRfidData(uid: string) {
    // Si le compte est bloqué, ne pas continuer
    if (this.isLocked) {
      this.serverError = `Trop de tentatives échouées. Compte bloqué pendant ${this.remainingTime} secondes.`;
      return;
    }

    this.isLoading = true;
    this.serverError = '';

    // Appeler le service pour vérifier l'UID
    this.loginService.loginbycard(uid).subscribe({
      next: () => {
        this.isLoading = false;

        // Réinitialiser le compteur de tentatives échouées en cas de succès
        this.resetLockState();

        // Réinitialiser les erreurs
        this.serverError = '';
        this.emailError = '';
        this.passwordError = '';

        // Rediriger vers la route par défaut
        this.router.navigate(['/dashboard/default']);
      },
      error: (error: Error) => {
        this.isLoading = false;

        // En cas d'échec, on incrémente le compteur d'erreurs
        this.incrementFailedAttempts();

        if (this.isLocked) {
          this.serverError = `Trop de tentatives échouées. Compte bloqué pendant ${this.remainingTime} secondes.`;
        } else {
          this.serverError = error.message || 'Erreur lors de la connexion par RFID';
        }
      }
    });
  }

  // Restaurer l'état de blocage depuis le localStorage
  private restoreLockState(): void {
    const lockData = localStorage.getItem('loginLockData');
    if (lockData) {
      const data = JSON.parse(lockData);
      const now = new Date().getTime();
      const lockExpiry = data.lockExpiry;

      // Vérifier si le blocage est encore actif
      if (now < lockExpiry) {
        this.isLocked = true;
        this.failedAttempts = data.attempts;
        this.remainingTime = Math.ceil((lockExpiry - now) / 1000);
        this.startLockTimer();
        this.resetFormFields(); // Réinitialiser les champs du formulaire
      } else {
        // Le blocage a expiré, nettoyer les données
        localStorage.removeItem('loginLockData');
        this.resetLockState();

         
      // Effacer explicitement le message d'erreur
      this.serverError = '';
      }
    }
  }

  // Sauvegarder l'état de blocage dans le localStorage
  private saveLockState(): void {
    if (this.isLocked) {
      const now = new Date().getTime();
      const lockExpiry = now + (this.remainingTime * 1000);
      const lockData = {
        attempts: this.failedAttempts,
        lockExpiry: lockExpiry
      };
      localStorage.setItem('loginLockData', JSON.stringify(lockData));
    } else {
      localStorage.removeItem('loginLockData');
    }
  }

  // Démarrer le timer de blocage
  private startLockTimer(): void {
    if (this.lockTimerSubscription) {
      this.lockTimerSubscription.unsubscribe();
    }

    this.lockTimerSubscription = interval(1000)
      .pipe(take(this.remainingTime))
      .subscribe({
        next: () => {
          this.remainingTime--;
          this.saveLockState();
        },
        complete: () => {
          this.resetLockState();
          // Effacer le message d'erreur lié au blocage
          if (this.serverError.includes('Trop de tentatives échouées')) {
            this.serverError = '';
          }
        }
      });
  }

  // Réinitialiser l'état de blocage
  private resetLockState(): void {
    this.isLocked = false;
    this.remainingTime = 0;
    this.failedAttempts = 0;
    localStorage.removeItem('loginLockData');

    // Effacer le message d'erreur lié au blocage
    if (this.serverError.includes('Trop de tentatives échouées')) {
      this.serverError = '';
    }
  }

  // Réinitialiser les champs du formulaire
  private resetFormFields(): void {
    this.email = '';
    this.password = '';
    this.emailError = '';
    this.passwordError = '';
    this.emailTouched = false;
    this.passwordTouched = false;
  }

  // Incrémenter le compteur de tentatives échouées
  private incrementFailedAttempts(): void {
    this.failedAttempts++;

    // Si on atteint 3 tentatives échouées, bloquer le compte
    if (this.failedAttempts >= 3) {
      this.isLocked = true;
      this.remainingTime = this.lockDuration;
      this.startLockTimer();
      this.saveLockState();
      this.resetFormFields(); // Réinitialiser les champs du formulaire
    }
  }

  // Valider l'email en temps réel
  validateEmail(): void {
    this.emailTouched = true;
    this.emailError = '';
    if (!this.email) {
      this.emailError = 'L\'email est requis';
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Format d\'email invalide';
    }
  }

  // Valider le mot de passe en temps réel
  validatePassword(): void {
    this.passwordTouched = true;
    this.passwordError = '';
    if (!this.password) {
      this.passwordError = 'Le mot de passe est requis';
    } else if (this.password.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères';
    }
  }

  // Vérifier si le formulaire est valide
  isFormValid(): boolean {
    // Si le compte est bloqué, le formulaire est invalide
    if (this.isLocked) {
      return false;
    }

    // Si les champs n'ont pas été touchés, on considère qu'ils sont invalides
    if (!this.emailTouched || !this.passwordTouched) {
      return false;
    }

    return !!this.email && !!this.password && !this.emailError && !this.passwordError;
  }

  // Méthode pour gérer la connexion par email et mot de passe
  onLogin() {
    // Si le compte est bloqué, ne pas continuer
    if (this.isLocked) {
      return;
    }

    // Marquer les champs comme touchés pour afficher toutes les erreurs
    this.emailTouched = true;
    this.passwordTouched = true;

    // Réinitialiser les erreurs de serveur
    this.serverError = '';

    // Valider les champs avant de soumettre
    this.validateEmail();
    this.validatePassword();

    // Vérifier si le formulaire est valide
    if (!this.email || !this.password || this.emailError || this.passwordError) {
      return;
    }

    this.isLoading = true;

    this.loginService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;

        // Réinitialiser le compteur de tentatives échouées en cas de succès
        this.resetLockState();

        // Réinitialiser les champs du formulaire
        this.resetFormFields();

        // Rediriger vers la route par défaut
        this.router.navigate(['/dashboard/default']);
      },
      error: (error) => {
        this.isLoading = false;

        // Incrémenter le compteur de tentatives échouées
        this.incrementFailedAttempts();

        // Gestion des erreurs spécifiques
        if (error.status === 401) {
          if (this.isLocked) {
            this.serverError = `Trop de tentatives échouées. Compte bloqué pendant ${this.remainingTime} secondes.`;
          } else {
            this.serverError = 'Email ou mot de passe incorrect';
          }
        } else if (error.status === 500) {
          this.serverError = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
        } else if (error.status === 0) {
          this.serverError = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
        } else {
          this.serverError = error.message || 'Une erreur est survenue lors de la connexion';
        }
      }
    });
  }

  // Méthode pour gérer la connexion par RFID
  onRfidLogin(event: Event) {
    event.preventDefault(); // Empêcher le comportement par défaut du bouton

    // Si le compte est bloqué, ne pas continuer
    if (this.isLocked) {
      this.serverError = `Trop de tentatives échouées. Compte bloqué pendant ${this.remainingTime} secondes.`;
      return;
    }

    // Afficher un message pour demander à l'utilisateur de scanner sa carte
    this.serverError = 'Veuillez scanner votre carte RFID...';

    // Ici, on ne fait rien de plus car c'est le socket.io qui va recevoir l'UID et appeler updateFormWithRfidData
  }

  // Méthode pour basculer la visibilité du mot de passe
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Hook de destruction du composant
  ngOnDestroy() {
    // Nettoyage des souscriptions pour éviter les fuites de mémoire
    if (this.lockTimerSubscription) {
      this.lockTimerSubscription.unsubscribe();
    }
  }
}
