import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierMedicalService } from 'src/app/service/dossier-medical.service';
import { UtilisateurService, Utilisateur } from 'src/app/service/utilisateur.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { RendezVous, RendezVousService } from 'src/app/service/rendez-vous.service';




@Pipe({
  name: 'filterRdv',
  pure: false
})
export class RendezVousPipe implements PipeTransform {
  transform(rendezVous: RendezVous[], filterType: 'patient' | 'medecin' = 'patient'): RendezVous[] {
    if (!rendezVous) return [];

    const today = new Date();
    
    return rendezVous.filter(rdv => {
      const rdvDate = new Date(rdv.date);
      
      switch (filterType) {
        case 'patient':
          return rdv.status !== 'annule' && rdvDate >= today;
        case 'medecin':
          return true; // Tous les rendez-vous pour le médecin
        default:
          return true;
      }
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}







@Component({
  selector: 'app-dossier-medical',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RendezVousPipe],
  template: `
   
   <header class="dossier-header">
  <div class="header-top">
    <div class="title-section">
      <h1><i class="fas fa-file-medical"></i> Dossier Médical</h1>
    </div>
    <div class="actions-section">
      <button class="back-btn" (click)="retourListePatients()">
        <i class="fas fa-arrow-left"></i> Retour à la liste des patients
      </button>
    </div>
  </div>

  <div class="patient-info-card" *ngIf="patient">
    <div class="patient-avatar">
      <i class="fas fa-user-circle"></i>
    </div>
    <div class="patient-details">
      <h2>{{ patient.nom }} {{ patient.prenom }}</h2>
      <div class="patient-metadata">
        <span><i class="fas fa-birthday-cake"></i> {{ calculateAge(patient.dateNaissance) }} ans</span>
        <span><i class="fas fa-venus-mars"></i> {{ patient.genre }}</span>
        <span *ngIf="patient.groupeSanguin"><i class="fas fa-tint"></i> {{ patient.groupeSanguin }}</span>
        <span *ngIf="patient.categorie"><i class="fas fa-tag"></i> {{ formatCategorie(patient.categorie) }}</span>
      </div>
    </div>
   
    </div>
 

  <div class="tabs" *ngIf="dossierMedical && !loading">
    <button 
      [class.active]="activeTab === 'infos'" 
      (click)="activeTab = 'infos'"
    >
      <i class="fas fa-info-circle"></i> Informations
    </button>
    <button 
      [class.active]="activeTab === 'constantes'" 
      (click)="activeTab = 'constantes'"
    >
      <i class="fas fa-heartbeat"></i> Constantes vitales
    </button>
    <button 
      [class.active]="activeTab === 'rdv'" 
      (click)="activeTab = 'rdv'"
    >
      <i class="fas fa-calendar-alt"></i> Rendez-vous
    </button>

    <div *ngIf="activeTab === 'rdv'" class="rendez-vous-section">
      <div class="section-header">
        <h2>Mes Rendez-vous</h2>
        <button class="add-rdv-btn" (click)="ouvrirFormulaireNouveauRdv()">
          <i class="fas fa-plus"></i> Nouveau Rendez-vous
        </button>
      </div>

      <div *ngIf="rendezVous?.length; else pasDeRdv" class="rdv-list">
        <div *ngFor="let rdv of rendezVous | filterRdv:'patient'" class="rdv-item">
          <div class="rdv-details">
            <div class="rdv-date-time">
              <span class="date">{{ formatDate(rdv.date) }}</span>
              <span class="heure">{{ formatHeure(rdv.heure) }}</span>
            </div>
            <div class="rdv-info">
              <p class="motif">{{ rdv.motif }}</p>
              <span [ngClass]="getRdvStatusClass(rdv)" class="rdv-status">
                {{ getRdvStatus(rdv) }}
              </span>
            </div>
          </div>
          <div class="rdv-actions">
            <button 
              *ngIf="rdv.status === 'en_attente'" 
              class="btn-annuler" 
              (click)="annulerRendezVous(rdv)">
              Annuler
            </button>
          </div>
        </div>
      </div>

      <ng-template #pasDeRdv>
        <p class="no-rdv-message">Aucun rendez-vous programmé.</p>
      </ng-template>

      <!-- Formulaire Nouveau Rendez-vous reste similaire -->
      <div *ngIf="showNouveauRdvForm" class="nouveau-rdv-form">
        <form [formGroup]="rdvForm" (ngSubmit)="soumettreNouveauRdv()">
          <div class="form-group">
            <label for="date">Date</label>
            <input 
              type="date" 
              id="date" 
              formControlName="date" 
              [min]="minDate" 
              required
            >
            <div *ngIf="rdvForm.get('date')?.invalid && rdvForm.get('date')?.touched" class="error-message">
              Date invalide ou antérieure à aujourd'hui
            </div>
          </div>
          <div class="form-group">
            <label for="heure">Heure</label>
            <input type="time" id="heure" formControlName="heure" required>
          </div>
          <div class="form-group">
            <label for="motif">Motif</label>
            <input 
              type="text" 
              id="motif" 
              formControlName="motif" 
              required 
              minlength="5"
            >
            <div *ngIf="rdvForm.get('motif')?.invalid && rdvForm.get('motif')?.touched" class="error-message">
              Le motif doit contenir au moins 5 caractères
            </div>
          </div>
          <div class="form-group">
            <label for="details">Détails supplémentaires (optionnel)</label>
            <textarea id="details" formControlName="details" maxlength="500"></textarea>
          </div>
          <div class="form-actions">
            <button 
              type="submit" 
              [disabled]="rdvForm.invalid">
              Demander Rendez-vous
            </button>
            <button type="button" (click)="annulerNouveauRdv()">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  
    
    
  `,
  styles: [`

   .dossier-header {
  margin-bottom: 25px;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(to right, #f7f9fc, #ffffff);
  position: relative;
}


.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.title-section h1 {
  color: #009688;
  margin: 0;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-section h1 i {
  color: #00796b;
}

.actions-section {
  display: flex;
  gap: 10px;
}

.back-btn {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

.patient-info-card {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #f9f9f9;
  margin: 0 0 15px 0;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.patient-avatar {
  font-size: 2.5rem;
  color: #80cbc4;
  margin-right: 15px;
}

.patient-details {
  flex: 1;
}

.patient-details h2 {
  margin: 0 0 5px 0;
  font-size: 1.5rem;
  color: #333;
}

.patient-metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #666;
}

.patient-metadata span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.patient-metadata i {
  color: #00897b;
}



.tabs {
  display: flex;
  padding: 0 20px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.tabs button {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.tabs button:hover {
  color: #009688;
  background-color: rgba(0, 150, 136, 0.05);
}

.tabs button.active {
  color: #009688;
  border-bottom: 3px solid #009688;
  font-weight: 500;
}

.tabs button i {
  font-size: 16px;
}

/* Pour les écrans mobiles */
@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .actions-section {
    margin-top: 10px;
    width: 100%;
  }
  
  .patient-info-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .patient-avatar {
    margin-bottom: 10px;
  }
  
  .patient-actions {
    margin-top: 15px;
    width: 100%;
    justify-content: flex-end;
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    padding: 0;
  }
  
  .tabs button {
    padding: 10px 15px;
  }
}


//Style pour RV
.rendez-vous-section {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 25px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    
    h2 {
      color: #2c3e50;
      font-size: 1.5rem;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      
      &::before {
        content: '📅';
        display: inline-block;
      }
    }
    
    .add-rdv-btn {
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 25px;
      padding: 10px 15px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: #2980b9;
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }
      
      i {
        font-size: 1rem;
      }
    }
  }
  
  .rdv-list {
    display: grid;
    gap: 15px;
    
    .rdv-item {
      background-color: #f7f9fc;
      border: 1px solid #e7eaf3;
      border-radius: 10px;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-color: #3498db;
      }
      
      .rdv-details {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-grow: 1;
        
        .rdv-date-time {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100px;
          
          .date {
            font-weight: bold;
            color: #2c3e50;
            font-size: 1rem;
          }
          
          .heure {
            color: #7f8c8d;
            font-size: 0.9rem;
          }
        }
        
        .rdv-info {
          flex-grow: 1;
          
          .motif {
            margin: 0;
            color: #34495e;
            font-weight: 500;
          }
          
          .rdv-status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            margin-top: 5px;
          }
        }
      }
      
      .rdv-actions {
        .btn-annuler {
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 8px 15px;
          transition: all 0.3s ease;
          
          &:hover {
            background-color: #c0392b;
            transform: scale(1.05);
          }
        }
      }
    }
  }
  
  .no-rdv-message {
    text-align: center;
    color: #95a5a6;
    padding: 30px;
    background-color: #f8f9fa;
    border-radius: 10px;
    font-style: italic;
  }
}

@media (max-width: 768px) {
  .rendez-vous-section {
    
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
      
      .add-rdv-btn {
        width: 100%;
        justify-content: center;
      }
    }
    
    .rdv-list .rdv-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
      
      .rdv-details {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        
        .rdv-date-time {
          width: 100%;
          flex-direction: row;
          justify-content: space-between;
          margin-bottom: 10px;
        }
      }
      
      .rdv-actions {
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
    
   
    
  `]
})
export class DossierMedicalComponent implements OnInit {
  patientId: string | null = null;
  patient: Utilisateur | null = null;
  dossierMedical: any = null;
  loading: boolean = true;
  error: string = '';
  editMode: boolean = false;
  rendezVous: RendezVous[] = [];

  dossierMedicalOriginal: any = null; // Pour pouvoir annuler les modifications
  
  // Nouveaux champs pour la version améliorée
  activeTab: 'infos' | 'constantes' | 'rdv'   = 'infos' ;
  showAddConstantesForm: boolean = false;
  showAddRdvForm: boolean = false;
  constantesForm: FormGroup;
  rdvForm: FormGroup;
  showNouveauRdvForm: boolean = false;
  minDate: string;

 
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rendezVousService: RendezVousService,
    private dossierMedicalService: DossierMedicalService,
    private utilisateurService: UtilisateurService,
    private fb: FormBuilder
  ) {
    // Initialisation des formulaires
   
   // Définir la date minimale à aujourd'hui
   const today = new Date();
   this.minDate = today.toISOString().split('T')[0];

   this.rdvForm = this.fb.group({
     date: ['', [
       Validators.required,
       this.futureDateValidator
     ]],
     heure: ['', Validators.required],
     motif: ['', [
       Validators.required, 
       Validators.minLength(5)
     ]],
     details: ['', Validators.maxLength(500)]
   });
 }




  
  
  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    console.log('ID du patient:', this.patientId); // Log pour vérifier l'ID
    if (this.patientId) {
      this.chargerDonnees();
    } else {
      this.error = 'ID du patient non trouvé';
      this.loading = false;
    }
  }


  chargerDonnees(): void {
    if (!this.patientId) return;
  
    this.utilisateurService.getUtilisateurById(this.patientId).subscribe({
      next: (response) => {
        console.log('Réponse de l\'API:', response); // Log pour vérifier la réponse complète
        if (response.status && response.data) {
          this.patient = response.data;
          console.log('Données du patient:', this.patient); // Log pour vérifier les données du patient
          this.chargerDossierMedical();
        } else {
          this.error = 'Données du patient non disponibles';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des informations du patient', err);
        this.error = 'Impossible de charger les informations du patient';
        this.loading = false;
      }
    });
  }


  
  chargerDossierMedical(): void {
    if (!this.patientId) return;
    
    this.dossierMedicalService.getDossierMedical(this.patientId).subscribe({
      next: (response) => {
        // Vérifier si la réponse contient un statut et des données
        if (response && response.status === true && response.data) {
          this.dossierMedical = response.data;
          // S'assurer que les tableaux sont initialisés
          if (!this.dossierMedical.constantes_vitales) {
            this.dossierMedical.constantes_vitales = [];
          }
          if (!this.dossierMedical.rendez_vous) {
            this.dossierMedical.rendez_vous = [];
          }
        } else {
          // Si la structure de la réponse n'est pas celle attendue
          console.error('Format de réponse inattendu', response);
          this.error = 'Format de réponse inattendu';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du dossier médical', err);
        if (err.status === 404) {
          this.error = 'Dossier médical non trouvé pour ce patient. Voulez-vous en créer un nouveau?';
        } else {
          this.error = `Erreur ${err.status}: ${err.error?.message || 'Impossible de charger le dossier médical'}`;
        }
        this.loading = false;
      }
    });
  }
  
  creerNouveauDossier(): void {
    if (!this.patientId) return;
    
    this.loading = true;
    const dossierInitial = {
      date: new Date().toISOString().split('T')[0],
      notes: `Dossier médical initial créé pour ${this.patient?.nom || ''} ${this.patient?.prenom || ''}`,
      antecedents_medicaux: '',
      allergies: '',
      traitements_en_cours: '',
      constantes_vitales: [],
      rendez_vous: []
    };
    
    this.dossierMedicalService.createDossierMedical(this.patientId, dossierInitial).subscribe({
      next: (response) => {
        if (response && response.status === true && response.data) {
          this.dossierMedical = response.data;
          this.loading = false;
          this.error = '';
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Dossier médical créé avec succès',
            confirmButtonColor: '#3085d6'
          });
        } else {
          console.error('Format de réponse inattendu', response);
          this.error = 'Format de réponse inattendu';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création du dossier médical', err);
        this.error = err.error?.message || 'Impossible de créer le dossier médical';
        this.loading = false;
      }
    });
  }
  
calculateAge(dateNaissance?: string): number {
  if (!dateNaissance) {
   // console.warn('Date de naissance non définie'); // Log pour vérifier si la date est manquante
    return 0;
  }

  const birthDate = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

 // console.log('Date de naissance:', dateNaissance, 'Âge calculé:', age); // Log pour vérifier l'âge calculé
  return age;
}


  formatCategorie(categorie: string): string {
    const categories: { [key: string]: string } = {
      'FEMME_ENCEINTE': 'Femme enceinte',
      'PERSONNE_AGEE': 'Personne âgée',
      'MALADE_CHRONIQUE': 'Malade chronique',
      'ENFANT': 'Enfant',
      'AUTRE': 'Autre'
    };
    
    return categories[categorie] || categorie;
  }
  
  chargerRendezVous(): void {
    if (!this.patientId) return;

    this.rendezVousService.getByPatient(this.patientId).subscribe({
      next: (response) => {
        this.rendezVous = response.rendezVous || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les rendez-vous'
        });
      }
    });
  }

  // Validateur personnalisé pour dates futures
  futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const today = new Date();
    const selectedDate = new Date(control.value);
    
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { pastDate: true };
  }

  ouvrirFormulaireNouveauRdv(): void {
    this.showNouveauRdvForm = true;
    this.rdvForm.reset();
  }

  annulerNouveauRdv(): void {
    this.showNouveauRdvForm = false;
    this.rdvForm.reset();
  }

  soumettreNouveauRdv(): void {
    if (this.rdvForm.valid && this.patientId) {
      const nouveauRdv: RendezVous = {
        patientId: this.patientId,
        medecinId: 'ID_MEDECIN_TRAITANT', // À remplacer dynamiquement
        date: this.rdvForm.value.date,
        heure: this.rdvForm.value.heure,
        motif: this.rdvForm.value.motif,
        details: this.rdvForm.value.details,
        status: 'en_attente',
        creePar: 'patient'
      };

      this.rendezVousService.requestAppointment(nouveauRdv).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Rendez-vous demandé',
            text: response.message || 'Votre demande de rendez-vous a été envoyée avec succès.'
          });
          this.chargerRendezVous();
          this.annulerNouveauRdv();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.error?.message || 'Impossible de demander un rendez-vous'
          });
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.rdvForm.controls).forEach(key => {
        const control = this.rdvForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  annulerRendezVous(rdv: RendezVous): void {
    if (!rdv.id) return;

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment annuler ce rendez-vous ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, retour'
    }).then((result) => {
      if (result.isConfirmed) {
        this.rendezVousService.update(rdv.id, { 
          status: 'annule',
         // motif_annulation: 'Annulé par le patient'
        }).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Rendez-vous annulé',
              text: 'Le rendez-vous a été annulé avec succès.'
            });
            this.chargerRendezVous();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: err.error?.message || 'Impossible d\'annuler le rendez-vous'
            });
          }
        });
      }
    });
  }

  // Méthodes utilitaires existantes (formatage, etc.)
  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    
    return date.toLocaleDateString('fr-FR', options);
  }
  
  formatHeure(heureStr?: string): string {
    return heureStr || '';
  }
  
  getRdvStatus(rdv: RendezVous): string {
    if (!rdv.date) return 'Planifié';
    
    const rdvDate = new Date(rdv.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (rdvDate.getTime() === today.getTime()) {
      return 'Aujourd\'hui';
    } else if (rdvDate < today) {
      return 'Passé';
    } else {
      return 'À venir';
    }
  }
  
  getRdvStatusClass(rdv: RendezVous): string {
    const status = this.getRdvStatus(rdv);
    
    switch (status) {
      case 'Aujourd\'hui':
        return 'status-today';
      case 'Passé':
        return 'status-past';
      case 'À venir':
        return 'status-upcoming';
      default:
        return '';
    }
  }

  toggleEditMode(): void {
    if (!this.editMode) {
      // Sauvegarder l'état original pour pouvoir annuler
      this.dossierMedicalOriginal = {...this.dossierMedical};
    }
    this.editMode = !this.editMode;
  }
  
  enregistrerModifications(): void {
    if (!this.patientId) return;
    
    this.loading = true;
    this.dossierMedicalService.updateDossierMedical(this.patientId, this.dossierMedical).subscribe({
      next: (response) => {
        if (response && response.status === true && response.data) {
          this.dossierMedical = response.data;
          this.loading = false;
          this.editMode = false;
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Dossier médical mis à jour avec succès',
            confirmButtonColor: '#3085d6'
          });
        } else {
          console.error('Format de réponse inattendu', response);
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Format de réponse inattendu',
            confirmButtonColor: '#d33'
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du dossier médical', err);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.error?.message || 'Impossible de mettre à jour le dossier médical',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
  
  annulerModifications(): void {
    this.dossierMedical = {...this.dossierMedicalOriginal};
    this.editMode = false;
  }
  
 
  
  retourListePatients(): void {
    this.router.navigate(['/patient']); // Ajustez le chemin selon votre routing
  }
}