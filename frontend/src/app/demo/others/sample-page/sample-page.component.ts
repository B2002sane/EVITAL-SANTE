import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilisateurService } from 'src/app/service/utilisateur.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


// project import
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-sample-page',
  standalone: true,
  imports: [CommonModule, CardComponent, ReactiveFormsModule],
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})
export class SamplePageComponent {
  patientForm: FormGroup;
  today: string = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  isHomme: boolean = false; // Pour cacher l'option "Femme Enceinte"



  constructor(private fb: FormBuilder, private utilisateurService: UtilisateurService , private router: Router) {
    this.patientForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      dateNaissance: ['', Validators.required],
      genre: ['', Validators.required],
      groupeSanguin: ['', Validators.required],
      poids: ['', [Validators.required, Validators.min(1)]],
      categorie: ['', Validators.required],
      adresse: ['', Validators.required],
      photo: [''],
      role: ['PATIENT'] ,// Ajout du champ `role`
      password:['password123']

    });

      // Écoute les changements de genre
      this.patientForm.get('genre')?.valueChanges.subscribe(value => {
        this.isHomme = value === 'HOMME';
      });
  }

  get f() { return this.patientForm.controls; }

  onSubmit() {
    if (this.patientForm.valid) {
      console.log('Envoi des données...', this.patientForm.value);
  
      this.utilisateurService.createUtilisateur(this.patientForm.value).subscribe({
        next: (response) => {
          console.log('Utilisateur ajouté avec succès', response);
  
          // ✅ SweetAlert pour succès
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Utilisateur ajouté avec succès !',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          }).then(() => {
            // ✅ Rediriger vers "/patient" après le clic sur "OK"
            this.router.navigate(['/patient']);
          });
  
          this.patientForm.reset();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout', error);
      
          let errorMessage = 'Une erreur est survenue.';
          
          if (error.error && error.error.errors) {
            const errors = error.error.errors;
            errorMessage = Object.values(errors)
              .flat() // Aplatit les tableaux imbriqués
              .join('----\n'); // Concatène les messages avec un saut de ligne
          }
  
          // ✅ SweetAlert pour erreur
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorMessage,
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK',
            timer: 5000, // Temps en millisecondes
            timerProgressBar: true, // Afficher une barre de progression
          });
        }
      });
  
    } else {
      console.log('Formulaire invalide');
    }
  }

  // Annuler et retourner à la liste
  onCancel() {
    this.router.navigate(['/patient']);
  }
  
}
