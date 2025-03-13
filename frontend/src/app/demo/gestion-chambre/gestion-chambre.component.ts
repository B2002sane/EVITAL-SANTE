import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionChambreService } from '../../service/gestion-chambre.service';
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';

// Interfaces
interface Lit {
  numero: number;
  patientId?: string | null;
  occupé: boolean;
}

interface Chambre {
  id?: string;
  numero: string;
  disponible: boolean;
  nombreLits: number;
  lits?: Lit[];
  patients?: Patient[];
}

interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  sexe?: 'M' | 'F';
  hospitalisation: boolean;
  chambreId?: string | null;
  role?: string;
}

interface StatutOccupation {
  chambre: string;
  nombreTotalLits: number;
  litsOccupes: number;
  litsDisponibles: number;
  disponible: boolean;
  patients: Patient[];
}

interface ValidationErrors {
  [key: string]: string[];
}

@Component({
  selector: 'app-gestion-chambre',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './gestion-chambre.component.html',
  styleUrls: ['./gestion-chambre.component.scss']
})
export class GestionChambreComponent implements OnInit {
  chambres: Chambre[] = [];
  chambresDisponibles: Chambre[] = [];
  detailChambre: Chambre | null = null;
  searchTerm: string = '';
  filteredChambres: Chambre[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;
  nouvellechambre: { numero: string, nombreLits: number } = { numero: '', nombreLits: 0 };
  selectedChambre: Chambre | null = null;
  selectedPatient: Patient | null = null;
  selectedLitNumero: number | null = null;
  patients: Patient[] = [];
  patientsNonHospitalises: Patient[] = [];
  statutOccupation: StatutOccupation | null = null;

  // Pagination pour les lits
  litsPagination = {
    currentPage: 1,
    itemsPerPage: 6,
  };

  constructor(public gestionChambreService: GestionChambreService) {}

  ngOnInit(): void {
    this.chargerChambres();
    this.chargerChambresDisponibles();
    this.chargerPatientsNonHospitalises();
  }

  chargerChambres(): void {
    this.gestionChambreService.getChambresList().subscribe({
      next: (data) => {
        this.chambres = data.chambres;
        this.filteredChambres = [...this.chambres];
        this.appliquerFiltres();
      },
      error: (error) => {
        this.afficherErreur('Erreur de chargement', 'Impossible de charger les chambres');
        console.error('Erreur lors de la récupération des chambres', error);
      }
    });
  }

  chargerChambresDisponibles(): void {
    this.gestionChambreService.getChambresDisponibles().subscribe({
      next: (data) => {
        this.chambresDisponibles = data.chambres;
      },
      error: (error) => {
        this.afficherErreur('Erreur de chargement', 'Impossible de charger les chambres disponibles');
        console.error('Erreur lors de la récupération des chambres disponibles', error);
      }
    });
  }

  chargerPatientsNonHospitalises(): void {
    this.gestionChambreService.getPatientsNonHospitalises().subscribe({
      next: (data) => {
        this.patientsNonHospitalises = data.patients;
      },
      error: (error) => {
        this.afficherErreur('Erreur de chargement', 'Impossible de charger les patients non hospitalisés');
        console.error('Erreur lors de la récupération des patients non hospitalisés', error);
      }
    });
  }

  compterLitsOccupes(chambre: Chambre): number {
    return chambre.lits?.filter(lit => lit.occupé).length || 0;
  }

  compterLitsDisponibles(chambre: Chambre): number {
    return chambre.lits?.filter(lit => !lit.occupé).length || 0;
  }

  creerNouvelleChambre(): void {
    if (!this.nouvellechambre.numero || this.nouvellechambre.nombreLits <= 0) {
      this.afficherErreur('Données invalides', 'Veuillez saisir un numéro et un nombre de lits valides');
      return;
    }

    this.gestionChambreService.creerChambre(this.nouvellechambre).subscribe({
      next: (response) => {
        this.afficherSucces('Chambre créée', `La chambre ${response.chambre.numero} a été ajoutée`);
        this.chargerChambres();
        this.nouvellechambre = { numero: '', nombreLits: 0 };
      },
      error: (error) => {
        this.afficherErreur('Erreur de création', error.error?.errors ? this.formatValidationErrors(error.error.errors) : 'Impossible de créer la chambre');
        console.error('Erreur de création de chambre', error);
      }
    });
  }

  formatValidationErrors(errors: ValidationErrors): string {
    return Object.values(errors).flat().join('<br>');
  }

  genererProchaineNumeroChambre(): string {
    if (!this.chambres || this.chambres.length === 0) {
      return '1';
    }

    const numerosExistants = this.chambres
      .map(chambre => chambre.numero)
      .map(numero => parseInt(numero))
      .filter(numero => !isNaN(numero));

    if (numerosExistants.length === 0) {
      return '1';
    }

    const prochainNumero = Math.max(...numerosExistants) + 1;
    return prochainNumero.toString();
  }

  ouvrirModalAjoutChambre(): void {
    const prochainNumero = this.genererProchaineNumeroChambre();

    Swal.fire({
      title: 'Ajouter une nouvelle chambre',
      html: `
        <div class="swal2-input-container">
          <div class="swal2-input-group">
            <label for="numero-chambre">Numéro de chambre</label>
            <input id="numero-chambre" class="swal2-input" value="${prochainNumero}" readonly>
            <small style="color: #666;">Le numéro est attribué automatiquement</small>
          </div>
          <div class="swal2-input-group">
            <label for="nombre-lits">Nombre de lits</label>
            <input id="nombre-lits" class="swal2-input" type="number" min="1" max="10" placeholder="Ex: 2">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#009688',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ajouter',
      cancelButtonText: 'Annuler',
      focusConfirm: false,
      preConfirm: () => {
        const numeroChambre = (document.getElementById('numero-chambre') as HTMLInputElement).value;
        const nombreLits = (document.getElementById('nombre-lits') as HTMLInputElement).value;

        if (!numeroChambre) {
          Swal.showValidationMessage('Numéro de chambre manquant');
          return false;
        }

        if (!nombreLits || parseInt(nombreLits) <= 0) {
          Swal.showValidationMessage('Veuillez saisir un nombre de lits valide');
          return false;
        }

        return { numero: numeroChambre, nombreLits: parseInt(nombreLits) };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.nouvellechambre = result.value;
        this.creerNouvelleChambre();
      }
    });
  }

  chargerStatutOccupation(chambreId: string): void {
    this.gestionChambreService.getStatutOccupation(chambreId).subscribe({
      next: (data) => {
        this.statutOccupation = data;
        this.afficherDetailsChambre();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du statut d\'occupation', error);
        this.afficherDetailsChambre();
      }
    });
  }

  mettreAJourChambre(chambre: Chambre): void {
    if (!chambre.id) {
      this.afficherErreur('Erreur de mise à jour', 'ID de chambre manquant ou invalide');
      return;
    }

    if (!chambre.numero || chambre.nombreLits <= 0) {
      this.afficherErreur('Données invalides', 'Veuillez saisir un numéro et un nombre de lits valides');
      return;
    }

    this.gestionChambreService.mettreAJourChambre(chambre.id, chambre).subscribe({
      next: (response) => {
        this.afficherSucces('Chambre mise à jour', `La chambre ${response.chambre.numero} a été modifiée`);
        this.chargerChambres();
      },
      error: (error) => {
        console.error('Erreur de mise à jour de chambre', error);
        this.afficherErreur('Erreur de mise à jour', error.error?.message || 'Impossible de mettre à jour la chambre');
      }
    });
  }

  ouvrirModalModificationChambre(chambre: Chambre): void {
    if (!chambre.id) {
      console.error('Tentative de modification d\'une chambre sans ID:', chambre);
      this.afficherErreur('Erreur', 'Impossible de modifier cette chambre (ID manquant)');
      return;
    }

    const chambreId = chambre.id;

    Swal.fire({
      title: `Modifier la chambre ${chambre.numero}`,
      html: `
        <div class="swal2-input-container">
          <div class="swal2-input-group">
            <label for="numero-chambre">Numéro de chambre</label>
            <input id="numero-chambre" class="swal2-input" value="${chambre.numero}" readonly>
            <small style="color: #666;">Le numéro de chambre ne peut pas être modifié</small>
          </div>
          <div class="swal2-input-group">
            <label for="nombre-lits">Nombre de lits</label>
            <input id="nombre-lits" class="swal2-input" type="number" min="1" max="10" placeholder="Ex: 2" value="${chambre.nombreLits}">
          </div>
          <input type="hidden" id="chambre-id" value="${chambreId}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#009688',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Mettre à jour',
      cancelButtonText: 'Annuler',
      focusConfirm: false,
      preConfirm: () => {
        const numeroChambre = chambre.numero;
        const nombreLits = (document.getElementById('nombre-lits') as HTMLInputElement).value;
        const id = (document.getElementById('chambre-id') as HTMLInputElement).value || chambreId;

        if (!nombreLits || parseInt(nombreLits) <= 0) {
          Swal.showValidationMessage('Veuillez saisir un nombre de lits valide');
          return false;
        }

        if (parseInt(nombreLits) < chambre.nombreLits) {
          const patientsAssignes = this.compterPatientsChambres(chambre);
          if (patientsAssignes > parseInt(nombreLits)) {
            Swal.showValidationMessage(
              `Impossible de réduire le nombre de lits à ${nombreLits}. ${patientsAssignes} patients sont actuellement assignés.`
            );
            return false;
          }
        }

        const chambreModifiee = {
          id: chambreId || id,
          numero: numeroChambre,
          nombreLits: parseInt(nombreLits),
        };

        return chambreModifiee;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.mettreAJourChambre(result.value);
      }
    });
  }

  supprimerChambre(chambreId: string, chambre?: Chambre): void {
    if (chambre && this.compterPatientsChambres(chambre) > 0) {
      Swal.fire({
        title: 'Suppression impossible',
        text: `Cette chambre contient actuellement ${this.compterPatientsChambres(chambre)} patient(s). Vous devez d'abord libérer les lits avant de pouvoir supprimer la chambre.`,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    Swal.fire({
      title: 'Confirmation de suppression',
      text: 'Voulez-vous vraiment supprimer cette chambre ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.gestionChambreService.supprimerChambre(chambreId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Chambre supprimée',
              text: 'La chambre a été supprimée avec succès',
              timer: 2000
            });
            this.chargerChambres();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression de la chambre', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur de suppression',
              text: 'Impossible de supprimer la chambre. ' + (error.error?.message || 'Veuillez réessayer.'),
            });
          }
        });
      }
    });
  }

  filterChambres(): void {
    this.filteredChambres = this.chambres.filter(chambre =>
      chambre.numero.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
  }

  paginatedChambres(): Chambre[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredChambres.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredChambres.length / this.itemsPerPage);
  }

  getPages(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  private afficherSucces(titre: string, message: string): void {
    Swal.fire({
      icon: 'success',
      title: titre,
      text: message,
      confirmButtonColor: '#3085d6'
    });
  }

  private afficherErreur(titre: string, message: string): void {
    Swal.fire({
      icon: 'error',
      title: titre,
      html: message,
      confirmButtonColor: '#d33'
    });
  }

  compterPatientsChambres(chambre: Chambre): number {
    return chambre.lits?.filter(lit => lit.patientId).length || 0;
  }

  private appliquerFiltres(): void {
    // Logique de filtrage supplémentaire si nécessaire
  }

  ouvrirModalAssignationLit(chambre: Chambre): void {
    this.gestionChambreService.getDetailsChambre(chambre.id!).subscribe({
      next: (response) => {
        const chambreActualisee = response.chambre;

        this.gestionChambreService.getPatientsNonHospitalises().subscribe({
          next: (patientsData) => {
            this.patientsNonHospitalises = patientsData.patients;

            const litsDisponibles = chambreActualisee.lits?.filter(lit => 
              !lit.occupé && !lit.patientId
            ) || [];

            if (litsDisponibles.length === 0) {
              Swal.fire({
                icon: 'info',
                title: 'Aucun lit disponible',
                text: 'Tous les lits de cette chambre sont déjà occupés.',
                confirmButtonColor: '#3085d6'
              });
              return;
            }

            if (this.patientsNonHospitalises.length === 0) {
              Swal.fire({
                icon: 'info',
                title: 'Aucun patient disponible',
                text: 'Il n\'y a actuellement aucun patient non hospitalisé à assigner.',
                confirmButtonColor: '#3085d6'
              });
              return;
            }

            Swal.fire({
              title: `Assigner un lit dans la chambre ${chambreActualisee.numero}`,
              html: `
                <div class="swal2-input-container">
                  <div class="swal2-input-group">
                    <label for="select-patient">Sélectionner un patient</label>
                    <select id="select-patient" class="swal2-input">
                      <option value="">Sélectionnez un patient</option>
                      ${this.patientsNonHospitalises.map(patient =>
                        `<option value="${patient.id}">${patient.nom} ${patient.prenom}</option>`
                      ).join('')}
                    </select>
                  </div>
                  <div class="swal2-input-group">
                    <label for="select-lit">Sélectionner un lit</label>
                    <select id="select-lit" class="swal2-input">
                      <option value="">Sélectionnez un lit</option>
                      ${litsDisponibles.map(lit =>
                        `<option value="${lit.numero}">Lit ${lit.numero}</option>`
                      ).join('')}
                    </select>
                  </div>
                </div>
              `,
              showCancelButton: true,
              confirmButtonColor: '#009688',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Assigner',
              cancelButtonText: 'Annuler',
              focusConfirm: false,
              preConfirm: () => {
                const patientId = (document.getElementById('select-patient') as HTMLSelectElement).value;
                const numeroLit = parseInt((document.getElementById('select-lit') as HTMLSelectElement).value);

                if (!patientId) {
                  Swal.showValidationMessage('Veuillez sélectionner un patient');
                  return false;
                }

                if (isNaN(numeroLit)) {
                  Swal.showValidationMessage('Veuillez sélectionner un lit');
                  return false;
                }

                return { patientId, numeroLit };
              }
            }).then((result) => {
              if (result.isConfirmed && result.value) {
                this.assignerLit(chambre.id!, result.value.patientId, result.value.numeroLit);
              }
            });
          },
          error: (error) => {
            console.error('Erreur lors de la récupération des patients non hospitalisés', error);
            this.afficherErreur('Erreur', 'Impossible de récupérer la liste des patients disponibles');
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des détails de la chambre', error);
        this.afficherErreur('Erreur', 'Impossible de récupérer les détails actualisés de la chambre');
      }
    });
  }

  assignerLit(chambreId: string, patientId: string, numeroLit: number): void {
    this.gestionChambreService.assignerLit(chambreId, patientId, numeroLit).subscribe({
      next: (response) => {
        this.afficherSucces('Lit assigné', response.message);
        this.chargerChambres();
        this.chargerChambresDisponibles();
        this.chargerPatientsNonHospitalises();

        if (this.detailChambre && this.detailChambre.id === chambreId) {
          setTimeout(() => this.voirDetailsChambre(chambreId), 500);
        }
      },
      error: (error) => {
        this.afficherErreur('Erreur d\'assignation', error.error?.message || 'Impossible d\'assigner le lit au patient');
        console.error('Erreur lors de l\'assignation du lit', error);
      }
    });
  }

  voirDetailsChambre(chambreId: string): void {
    this.gestionChambreService.getDetailsChambre(chambreId).subscribe({
      next: (data) => {
        this.detailChambre = data.chambre;
        this.chargerStatutOccupation(chambreId);
      },
      error: (error) => {
        this.afficherErreur('Erreur', 'Impossible de récupérer les détails de la chambre');
        console.error('Erreur lors de la récupération des détails de la chambre', error);
      }
    });
  }

  libererLit(chambreId: string, numeroLit: number, raison: string = 'Sortie standard'): void {
   
  
    this.gestionChambreService.libererLit(chambreId, numeroLit, raison).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Lit libéré',
          text: response.message || 'Le lit a été libéré avec succès',
          timer: 2000,
          showConfirmButton: false
        });
        this.chargerChambres();
        this.chargerChambresDisponibles();
        this.chargerPatientsNonHospitalises();
  
        if (this.detailChambre && this.detailChambre.id === chambreId) {
          setTimeout(() => this.voirDetailsChambre(chambreId), 500);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la libération du lit', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur de libération',
          text: error.error?.message || 'Impossible de libérer le lit. Veuillez réessayer.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

 confirmerLibererLit(chambreId: string, numeroLit: number): void {
  let patientInfo = '';
  if (this.detailChambre && this.detailChambre.lits) {
    const lit = this.detailChambre.lits.find(l => l.numero === numeroLit);
    if (lit && lit.patientId && this.statutOccupation) {
      const patient = this.statutOccupation.patients.find(p => p.id === lit.patientId);
      if (patient) {
        patientInfo = `<strong>${patient.nom} ${patient.prenom}</strong>`;
      }
    }
  }

  const messagePatient = patientInfo 
    ? `Vous êtes sur le point de libérer le lit ${numeroLit} occupé par ${patientInfo}.`
    : `Vous êtes sur le point de libérer le lit ${numeroLit}.`;

  Swal.fire({
    title: 'Libérer le lit',
    html: `
      <div class="swal2-input-container">
        <p>${messagePatient}</p>
        <div class="swal2-input-group">
          <label for="raison-liberation">Raison de la libération</label>
          <select id="raison-liberation" class="swal2-input">
            <option value="Sortie standard">Sortie standard</option>
            <option value="Transfert">Transfert vers un autre service</option>
            <option value="Sortie contre avis médical">Sortie contre avis médical</option>
            <option value="Décès">Décès</option>
            <option value="Erreur d'affectation">Erreur d'affectation</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div id="autre-raison-container" style="display: none;" class="swal2-input-group">
          <label for="autre-raison">Précisez la raison</label>
          <input id="autre-raison" class="swal2-input" placeholder="Précisez la raison...">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Libérer le lit',
    cancelButtonText: 'Annuler',
    didOpen: () => {
      // Afficher le champ "Autre raison" si "Autre" est sélectionné
      const raisonSelect = document.getElementById('raison-liberation') as HTMLSelectElement;
      const autreRaisonContainer = document.getElementById('autre-raison-container');
      
      raisonSelect?.addEventListener('change', () => {
        if (raisonSelect.value === 'Autre') {
          autreRaisonContainer?.style.setProperty('display', 'block');
        } else {
          autreRaisonContainer?.style.setProperty('display', 'none');
        }
      });
    },
    preConfirm: () => {
      const raisonSelect = document.getElementById('raison-liberation') as HTMLSelectElement;
      const autreRaisonInput = document.getElementById('autre-raison') as HTMLInputElement;
      
      let raison = raisonSelect.value;
      if (raison === 'Autre' && autreRaisonInput.value.trim()) {
        raison = autreRaisonInput.value.trim();
      }
      
      return raison;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.libererLit(chambreId, numeroLit, result.value as string);
    } else {
      // Si annulé, on réaffiche les détails de la chambre
      this.voirDetailsChambre(chambreId);
    }
  });
}

  private afficherDetailsChambre(): void {
    if (!this.detailChambre) return;

    let infoOccupation = '';
    if (this.statutOccupation) {
      const tauxOccupation = Math.round((this.statutOccupation.litsOccupes / this.statutOccupation.nombreTotalLits) * 100);
      infoOccupation = `
        <div style="margin-bottom: 15px; padding: 10px; border-radius: 8px; background-color: #f5f5f5;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span><strong>Taux d'occupation:</strong> ${tauxOccupation}%</span>
            <span><strong>Status:</strong> <span style="color: ${this.detailChambre.disponible ? '#4CAF50' : '#F44336'};">
              ${this.detailChambre.disponible ? 'Disponible' : 'Complète'}
            </span></span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Lits occupés:</strong> ${this.statutOccupation.litsOccupes}/${this.statutOccupation.nombreTotalLits}</span>
            <span><strong>Lits disponibles:</strong> ${this.statutOccupation.litsDisponibles}</span>
          </div>
          <div style="margin-top: 10px; height: 8px; width: 100%; background-color: #e0e0e0; border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${tauxOccupation}%; background-color: ${
              tauxOccupation > 80 ? '#F44336' : tauxOccupation > 50 ? '#FF9800' : '#4CAF50'
            };"></div>
          </div>
        </div>
      `;
    } else {
      const litsDisponibles = this.compterLitsDisponibles(this.detailChambre);
      const tauxOccupation = Math.round(((this.detailChambre.nombreLits - litsDisponibles) / this.detailChambre.nombreLits) * 100);
      infoOccupation = `
        <div style="margin-bottom: 15px; padding: 10px; border-radius: 8px; background-color: #f5f5f5;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span><strong>Taux d'occupation:</strong> ${tauxOccupation}%</span>
            <span><strong>Status:</strong> <span style="color: ${this.detailChambre.disponible ? '#4CAF50' : '#F44336'};">
              ${this.detailChambre.disponible ? 'Disponible' : 'Complète'}
            </span></span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Lits occupés:</strong> ${this.detailChambre.nombreLits - litsDisponibles}/${this.detailChambre.nombreLits}</span>
            <span><strong>Lits disponibles:</strong> ${litsDisponibles}</span>
          </div>
          <div style="margin-top: 10px; height: 8px; width: 100%; background-color: #e0e0e0; border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: ${tauxOccupation}%; background-color: ${
              tauxOccupation > 80 ? '#F44336' : tauxOccupation > 50 ? '#FF9800' : '#4CAF50'
            };"></div>
          </div>
        </div>
      `;
    }

    const lits = this.detailChambre.lits || [];
    const totalPages = Math.ceil(lits.length / this.litsPagination.itemsPerPage);

    if (this.litsPagination.currentPage > totalPages) {
      this.litsPagination.currentPage = totalPages > 0 ? totalPages : 1;
    }

    const startIndex = (this.litsPagination.currentPage - 1) * this.litsPagination.itemsPerPage;
    const endIndex = Math.min(startIndex + this.litsPagination.itemsPerPage, lits.length);
    const litsPage = lits.slice(startIndex, endIndex);

    let litsHTML = '';
    if (lits.length > 0) {
      litsHTML = `
        <h3 style="margin-top: 20px; margin-bottom: 10px; color: #333;">État des lits</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
          ${litsPage.map(lit => {
            const litOccupe = lit.occupé || (lit.patientId !== null && lit.patientId !== undefined);
            const statusColor = litOccupe ? '#F44336' : '#4CAF50';
            const bgColor = litOccupe ? '#ffebee' : '#e8f5e9';
            const statusText = litOccupe ? 'Occupé' : 'Libre';

            let patientInfo = '';
            if ((lit.occupé || lit.patientId) && lit.patientId && this.statutOccupation) {
              const patient = this.statutOccupation.patients.find(p => p.id === lit.patientId);
              if (patient) {
                patientInfo = `
                  <div style="margin-top: 8px; font-size: 0.9em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <strong>${patient.nom} ${patient.prenom}</strong>
                  </div>
                `;
              }
            }

            return `
              <div style="position: relative; border-radius: 8px; background-color: ${bgColor};
                   box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 15px; transition: all 0.3s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="font-weight: bold; font-size: 1.1em;">Lit ${lit.numero}</span>
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 12px;
                        background-color: ${statusColor}; color: white; font-size: 0.8em;">
                    ${statusText}
                  </span>
                </div>
                ${patientInfo}

                ${litOccupe ?
                  `<button class="liberer-lit-btn" data-numero="${lit.numero}"
                    style="width: 100%; background-color: #F44336; color: white; border: none;
                    border-radius: 4px; padding: 8px 10px; margin-top: 10px; cursor: pointer;
                    transition: background-color 0.3s ease; font-weight: bold;">
                    Libérer
                  </button>` :
                  ''
                }
              </div>
            `;
          }).join('')}
        </div>
      `;

      if (totalPages > 1) {
        litsHTML += `
          <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
            <button class="pagination-btn" id="prev-page-btn" style="margin-right: 10px; padding: 5px 10px;
                    background-color: #009688; color: white; border: none; border-radius: 4px; cursor: pointer;
                    ${this.litsPagination.currentPage === 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
              &laquo; Précédent
            </button>
            <div style="margin: 0 15px;">
              Page ${this.litsPagination.currentPage} / ${totalPages}
            </div>
            <button class="pagination-btn" id="next-page-btn" style="margin-left: 10px; padding: 5px 10px;
                    background-color: #009688; color: white; border: none; border-radius: 4px; cursor: pointer;
                    ${this.litsPagination.currentPage === totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
              Suivant &raquo;
            </button>
          </div>
        `;
      }
    } else {
      litsHTML = '<p style="margin-top: 15px; color: #757575;">Aucun lit configuré pour cette chambre.</p>';
    }

    let patientsHTML = '';
    if (this.statutOccupation && this.statutOccupation.patients && this.statutOccupation.patients.length > 0) {
      patientsHTML = `
        <h3 style="margin-top: 25px; margin-bottom: 10px; color: #333;">Patients hospitalisés</h3>
        <div style="max-height: 200px; overflow-y: auto; padding-right: 8px;">
          ${this.statutOccupation.patients.map(patient => {
            let numeroLit = '';
            if (this.detailChambre && this.detailChambre.lits) {
              const lit = this.detailChambre.lits.find(l => l.patientId === patient.id);
              if (lit) {
                numeroLit = `(Lit ${lit.numero})`;
              }
            }

            return `
              <div style="display: flex; justify-content: space-between; align-items: center;
                   margin-bottom: 8px; padding: 10px; background-color: #f9f9f9;
                   border-radius: 6px; border-left: 4px solid #3F51B5;">
                <span style="font-weight: 500;">${patient.nom} ${patient.prenom}</span>
                <span style="color: #757575; font-size: 0.9em;">${numeroLit}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (this.detailChambre.patients && this.detailChambre.patients.length > 0) {
      patientsHTML = `
        <h3 style="margin-top: 25px; margin-bottom: 10px; color: #333;">Patients hospitalisés</h3>
        <div style="max-height: 200px; overflow-y: auto; padding-right: 8px;">
          ${this.detailChambre.patients.map(patient => `
            <div style="display: flex; justify-content: space-between; align-items: center;
                 margin-bottom: 8px; padding: 10px; background-color: #f9f9f9;
                 border-radius: 6px; border-left: 4px solid #3F51B5;">
              <span style="font-weight: 500;">${patient.nom} ${patient.prenom}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    const chambreId = this.detailChambre.id;

    const customStyles = `
      <style>
        .liberer-lit-btn:hover {
          background-color: #D32F2F !important;
        }
        .detail-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        .detail-actions button {
          flex: 1;
          padding: 8px 15px;
          border: none;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .detail-actions .edit-btn {
          background-color: #2196F3;
          color: white;
        }
        .detail-actions .edit-btn:hover {
          background-color: #1976D2;
        }
        .detail-actions .assign-btn {
          background-color: #4CAF50;
          color: white;
        }
        .detail-actions .assign-btn:hover {
          background-color: #00796b;
        }
        .pagination-btn:hover {
          background-color: #00796b !important;
        }
      </style>
    `;

    Swal.fire({
      title: `Chambre ${this.detailChambre.numero}`,
      html: `
        ${customStyles}
        <div class="chambre-details">
          ${infoOccupation}
          ${litsHTML}
          ${patientsHTML}
          <div class="detail-actions">
            <button class="edit-btn" id="edit-chambre-btn">Modifier la chambre</button>
            <button class="assign-btn" id="assign-lit-btn" ${!this.detailChambre.disponible ? 'disabled style="opacity: 0.6; cursor: not-allowed;"' : ''}>
              Assigner un lit
            </button>
          </div>
        </div>
      `,
      width: 700,
      showConfirmButton: true,
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#757575',
      showClass: {
        popup: 'animate__animated animate__fadeIn'
      },
      didOpen: () => {
        document.querySelectorAll('.liberer-lit-btn').forEach(button => {
          const numeroLit = parseInt((button as HTMLElement).dataset['numero'] || '0');
          if (numeroLit && chambreId) {
            button.addEventListener('click', () => {
              Swal.close();
              setTimeout(() => {
                this.confirmerLibererLit(chambreId, numeroLit);
              }, 100);
            });
          }
        });

        const editButton = document.getElementById('edit-chambre-btn');
        if (editButton && chambreId) {
          editButton.addEventListener('click', () => {
            Swal.close();
            setTimeout(() => {
              this.ouvrirModalModificationChambre(this.detailChambre!);
            }, 100);
          });
        }

        const assignButton = document.getElementById('assign-lit-btn');
        if (assignButton && chambreId && this.detailChambre && this.detailChambre.disponible) {
          assignButton.addEventListener('click', () => {
            Swal.close();
            setTimeout(() => {
              this.ouvrirModalAssignationLit(this.detailChambre!);
            }, 100);
          });
        }

        const prevButton = document.getElementById('prev-page-btn');
        if (prevButton && this.litsPagination.currentPage > 1) {
          prevButton.addEventListener('click', () => {
            this.litsPagination.currentPage--;
            Swal.close();
            setTimeout(() => this.afficherDetailsChambre(), 100);
          });
        }

        const nextButton = document.getElementById('next-page-btn');
        if (nextButton && this.litsPagination.currentPage < totalPages) {
          nextButton.addEventListener('click', () => {
            this.litsPagination.currentPage++;
            Swal.close();
            setTimeout(() => this.afficherDetailsChambre(), 100);
          });
        }
      }
    });
  }
}