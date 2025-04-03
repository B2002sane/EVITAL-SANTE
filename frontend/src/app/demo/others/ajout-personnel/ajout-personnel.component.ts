import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UtilisateurService, Utilisateur } from 'src/app/service/utilisateur.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

// project import
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';

@Component({
  selector: 'app-ajout-personnel',
  imports: [CommonModule, CardComponent, ReactiveFormsModule],
  templateUrl: './ajout-personnel.component.html',
  styleUrls: ['./ajout-personnel.component.scss'],
  standalone: true
})
export class AjoutPersonnelComponent implements OnInit {
  personnelForm: FormGroup;
  isEditMode: boolean = false;
  userId: string | null = null;
  pageTitle: string = 'Ajout d\'un personnel médical';
  buttonText: string = 'VALIDER';
  photoPreview: string | null = null;
  photoFile: File | null = null;

  constructor(
    private fb: FormBuilder, 
    private utilisateurService: UtilisateurService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.personnelForm = this.createForm();
  }

  ngOnInit() {
    // Vérifier si nous sommes en mode édition
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      if (this.userId) {
        this.isEditMode = true;
        this.pageTitle = 'Modification d\'un personnel médical';
        this.buttonText = 'METTRE À JOUR';
        this.loadUserData(this.userId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      genre: ['', Validators.required],
      codeRfid: ['',Validators.required],
      adresse: ['', Validators.required],
      photo: [''],
      role: ['', Validators.required]
    });
  }

  get f() { return this.personnelForm.controls; }

  loadUserData(userId: string) {
    this.utilisateurService.getUtilisateurByIdEdit(userId).subscribe({
      next: (response) => {
        // Extraire l'utilisateur du champ "data"
        const user = response.data;
        
        // Pré-remplir le formulaire
        const formData = {
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          telephone: user.telephone || '',
          genre: user.genre || '',
          codeRfid: user.codeRfid || '',
          adresse: user.adresse || '',
          photo: '',
          role: user.role || ''
        };
        
        this.personnelForm.patchValue(formData);
        
        // Afficher la photo existante si disponible
        if (user.photo) {
          this.photoPreview = user.photo;
        }
        
        // En mode édition, le mot de passe n'est pas obligatoire
        if (this.isEditMode) {
          this.personnelForm.get('password')?.clearValidators();
          this.personnelForm.get('password')?.updateValueAndValidity();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données utilisateur', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les données de l\'utilisateur',
          confirmButtonColor: '#d33'
        });
        this.router.navigate(['/personnel-medical']);
      }
    });
  }

  onPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      this.photoFile = input.files[0];
      
      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreview = reader.result as string;
      };
      reader.readAsDataURL(this.photoFile);
    }
  }

  removePhoto() {
    this.photoPreview = null;
    this.photoFile = null;
    this.personnelForm.get('photo')?.setValue('');
  }

  onSubmit() {
    if (this.personnelForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.personnelForm.controls).forEach(key => {
        const control = this.personnelForm.get(key);
        control?.markAsTouched();
      });
      
      return;
    }

    // Préparer les données
    const formData = {...this.personnelForm.value};
    
    // Gérer le cas où le mot de passe est vide en mode édition
    if (this.isEditMode && !formData.password) {
      delete formData.password;
    }
    
    // Ajouter l'URL de la photo si disponible
    if (this.photoPreview && this.photoFile) {
      // Dans un cas réel, vous utiliseriez un service pour télécharger la photo
      // et obtenir l'URL, mais pour cet exemple, nous allons simuler
      formData.photo = this.photoPreview;
    }

    if (this.isEditMode && this.userId) {
      // Mode modification
      this.utilisateurService.updateUtilisateur(this.userId, formData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Personnel médical mis à jour avec succès !',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/personnel-medical']);
          });
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la mise à jour.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      // Mode ajout
      this.utilisateurService.createUtilisateur(formData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Personnel médical ajouté avec succès !',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/personnel-medical']);
          });
        },
    

          error: (error) => {
            console.error('Erreur lors de l\'ajout', error);
        
            let errorMessage = 'Une erreur est survenue.';
            
            if (error.error && error.error.errors) {
              const errors = error.error.errors;
              errorMessage = Object.values(errors)
                .flat() // Aplatit les tableaux imbriqués
                .join('   |  \n'); // Concatène les messages avec un saut de ligne
            }


          console.error('Erreur lors de l\'ajout', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorMessage,
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }

  // Annuler et retourner à la liste
  onCancel() {
    this.router.navigate(['/personnel-medical']);
  }
}