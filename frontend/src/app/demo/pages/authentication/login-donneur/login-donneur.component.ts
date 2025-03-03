import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login-donneur',
  standalone: true, // ✅ Ajouté si ce composant est indépendant
  imports: [CommonModule, FormsModule], // ✅ Ajout de FormsModule pour NgForm et ngModel
  templateUrl: './login-donneur.component.html',
  styleUrls: ['./login-donneur.component.scss'] // ✅ Correction de "styleUrl" -> "styleUrls"
})
export class LoginDonneurComponent {
  email: string = '';
  password: string = '';

  // ✅ Méthode de validation du mot de passe
  checkPassword(): boolean {
    return this.password.length >= 8;
  }
}
