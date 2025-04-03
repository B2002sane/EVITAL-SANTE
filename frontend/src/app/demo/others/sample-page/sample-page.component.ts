import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilisateurService } from 'src/app/service/utilisateur.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';



// project import
//import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-sample-page',
  standalone: true,
  imports: [CommonModule,  ReactiveFormsModule],
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})


export class SamplePageComponent implements OnInit {
  patientId: string | null = null;
  patientForm: FormGroup;
  today: string = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  isHomme: boolean = false; // Pour cacher l'option "Femme Enceinte"
  isLoading: boolean = false;
  isEditMode: boolean = false;
  pageTitle: string = 'Ajout d\'un patient';

  constructor(
    private fb: FormBuilder, 
    private utilisateurService: UtilisateurService,
    private router: Router,
    private route: ActivatedRoute
  ) {
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
      role: ['PATIENT'],
      password: ['password123']
    });

    // Écoute les changements de genre
    this.patientForm.get('genre')?.valueChanges.subscribe(value => {
      this.isHomme = value === 'HOMME';
    });
  }



  ngOnInit(): void {
    // Déterminer si nous sommes en mode édition en vérifiant les paramètres de route
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.patientId = params['id']; // Plus besoin de convertir en nombre avec +
        this.isEditMode = true;
        this.pageTitle = 'Modification d\'un patient';
        this.loadPatientData(this.patientId);
        
        // En mode édition, le mot de passe n'est pas requis
        this.patientForm.get('password')?.clearValidators();
        this.patientForm.get('password')?.updateValueAndValidity();
      }
    });
  }



  loadPatientData(id: string): void {
    this.isLoading = true;
    this.utilisateurService.getUtilisateurByIdEdit(id).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          // Accéder aux données à travers response.data
          const patient = response.data;
          
          // Préremplir le formulaire avec les données existantes
          this.patientForm.patchValue({
            nom: patient.nom,
            prenom: patient.prenom,
            email: patient.email,
            telephone: patient.telephone,
            dateNaissance: patient.dateNaissance,
            genre: patient.genre,
            groupeSanguin: patient.groupeSanguin,
            poids: patient.poids,
            categorie: patient.categorie || '',  // Au cas où ce champ n'existe pas dans la réponse
            adresse: patient.adresse || '',      // Au cas où ce champ n'existe pas dans la réponse
            photo: patient.photo || '',          // Au cas où ce champ n'existe pas dans la réponse
            role: patient.role,
            password: ''  // Vider le champ mot de passe en mode édition
          });
          
          // Mise à jour de isHomme en fonction du genre chargé
          this.isHomme = patient.genre === 'HOMME';
        } else {
          // Gérer le cas où response.data est absent
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Données patient incorrectes ou manquantes',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/patient']);
          });
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données du patient', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les données du patient',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/patient']);
        });
        
        this.isLoading = false;
      }
    });
  }




  get f() { return this.patientForm.controls; }

  onPhotoChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérification du type de fichier
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        Swal.fire({
          icon: 'error',
          title: 'Format non valide',
          text: 'Veuillez sélectionner une image (jpeg, jpg, png, gif)',
          confirmButtonColor: '#d33',
        });
        return;
      }

      // Vérification de la taille (max 2 Mo)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Fichier trop volumineux',
          text: 'La taille de l\'image ne doit pas dépasser 2 Mo',
          confirmButtonColor: '#d33',
        });
        return;
      }

      // Conversion de l'image en base64
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Mise à jour du formulaire avec l'image en base64
        this.patientForm.patchValue({
          photo: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }




  
  onSubmit() {
    if (this.patientForm.valid) {
      console.log('Envoi des données...', this.patientForm.value);
      
      const patientData = {...this.patientForm.value};
      
      // En mode édition, si le mot de passe est vide, le retirer
      if (this.isEditMode && !patientData.password) {
        delete patientData.password;
      }
      
      if (this.isEditMode && this.patientId) {
        // Mise à jour d'un patient existant
        this.utilisateurService.updateUtilisateur(this.patientId, patientData).subscribe({
          next: (response) => {
            console.log('Utilisateur modifié avec succès', response);
            
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Utilisateur modifié avec succès !',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK'
            }).then(() => {
              this.router.navigate(['/patient']);
            });
          },
          error: this.handleError
        });
      } else {
        // Création d'un nouveau patient
        this.utilisateurService.createUtilisateur(patientData).subscribe({
          next: (response) => {
            console.log('Utilisateur ajouté avec succès', response);
            
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Utilisateur ajouté avec succès !',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK'
            }).then(() => {
              this.router.navigate(['/patient']);
            });
            
            this.patientForm.reset();
          },
          error: this.handleError
        });
      }
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.patientForm.controls).forEach(key => {
        this.patientForm.get(key)?.markAsTouched();
      });
      
      console.log('Formulaire invalide');
    }
  }
  
  handleError(error: any) {
    console.error('Erreur lors de l\'opération', error);
    
    let errorMessage = 'Une erreur est survenue.';
    
    if (error.error && error.error.errors) {
      const errors = error.error.errors;
      errorMessage = Object.values(errors)
        .flat() // Aplatit les tableaux imbriqués
        .join('----\n'); // Concatène les messages avec un saut de ligne
    }
    
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

  // Annuler et retourner à la liste
  onCancel() {
    this.router.navigate(['/patient']);
  }
}