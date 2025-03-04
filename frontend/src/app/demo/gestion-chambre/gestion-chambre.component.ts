import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

import { GestionChambreService, Chambre, Patient } from '../../service/gestion-chambre.service';

@Component({
  selector: 'app-gestion-chambre',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './gestion-chambre.component.html',
  styleUrls: ['./gestion-chambre.component.scss'],
  providers: [GestionChambreService]
})
export class GestionChambreComponent implements OnInit {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
gererLits(_t21: Chambre) {
throw new Error('Method not implemented.');
}
  chambres: Chambre[] = [];
  loading = false;
  error = '';

  constructor(
    private gestionChambreService: GestionChambreService
  ) {}

  ngOnInit(): void {
    this.loadChambres();
  }

  // Charger les chambres
  loadChambres(): void {
    this.loading = true;
    this.error = '';
    this.gestionChambreService.getChambres().subscribe({
      next: (data) => {
        this.chambres = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des chambres';
        console.error(err);
        this.loading = false;
      }
    });
  }

  // Obtenir le nombre de lits occupés
  getLitsOccupes(chambre: Chambre): number {
    return chambre.lits.filter(lit => lit.occupe).length;
  }

  // Déterminer le statut d'une chambre
  getStatut(chambre: Chambre): string {
    const litsOccupes = this.getLitsOccupes(chambre);

    if (litsOccupes === 0) {
      return 'Libre';
    } else if (litsOccupes < chambre.nombreLits) {
      return 'Partiellement occupée';
    } else {
      return 'Occupée';
    }
  }

  // Voir les détails d'une chambre
  voirChambre(chambre: Chambre): void {
    this.gestionChambreService.getStatutOccupation(chambre.numero).subscribe({
      next: (data) => {
        const patientsList = data.patients && data.patients.length > 0
          ? data.patients.map((p: Patient) => `<li>${p.nom} ${p.prenom}</li>`).join('')
          : '<li>Aucun patient</li>';

        Swal.fire({
          title: `Chambre ${chambre.numero}`,
          html: `
            <div>
              <p><strong>Statut:</strong> ${this.getStatut(chambre)}</p>
              <p><strong>Nombre de lits:</strong> ${chambre.nombreLits}</p>
              <p><strong>Lits occupés:</strong> ${this.getLitsOccupes(chambre)} / ${chambre.nombreLits}</p>
              <p><strong>Patients:</strong></p>
              <ul>${patientsList}</ul>
            </div>
          `,
          confirmButtonText: 'Fermer'
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails', err);
        Swal.fire('Erreur', 'Impossible de charger les détails de la chambre', 'error');
      }
    });
  }

  // Ajouter une nouvelle chambre
  ajouterChambre(): void {
    Swal.fire({
      title: 'Ajouter une chambre',
      html: `
        <div class="form-group">
          <label for="numero">Numéro de chambre</label>
          <input id="numero" type="text" class="swal2-input" placeholder="Numéro">
        </div>
        <div class="form-group">
          <label for="nombreLits">Nombre de lits</label>
          <input id="nombreLits" type="number" class="swal2-input" placeholder="Nombre de lits" min="1">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ajouter',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const numero = (document.getElementById('numero') as HTMLInputElement)?.value;
        const nombreLitsInput = document.getElementById('nombreLits') as HTMLInputElement;
        const nombreLits = nombreLitsInput ? parseInt(nombreLitsInput.value) : NaN;

        if (!numero || isNaN(nombreLits) || nombreLits < 1) {
          Swal.showValidationMessage('Veuillez remplir tous les champs correctement');
          return false;
        }

        return { numero, nombreLits };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { numero, nombreLits } = result.value;

        this.gestionChambreService.createChambre({ numero, nombreLits }).subscribe({
          next: () => {
            Swal.fire('Succès', 'Chambre ajoutée avec succès', 'success');
            this.loadChambres();
          },
          error: (err) => {
            console.error('Erreur lors de l\'ajout', err);
            Swal.fire('Erreur', 'Impossible d\'ajouter la chambre', 'error');
          }
        });
      }
    });
  }

  // Modifier une chambre
  modifierChambre(chambre: Chambre): void {
    Swal.fire({
      title: 'Modifier la chambre',
      html: `
        <div class="form-group">
          <label for="numero">Numéro de chambre</label>
          <input id="numero" type="text" class="swal2-input" value="${chambre.numero}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Modifier',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const numeroInput = document.getElementById('numero') as HTMLInputElement;
        const numero = numeroInput ? numeroInput.value : '';

        if (!numero) {
          Swal.showValidationMessage('Veuillez remplir tous les champs correctement');
          return false;
        }

        return { numero };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { numero } = result.value;

        this.gestionChambreService.updateChambre(chambre.numero, { numero }).subscribe({
          next: () => {
            Swal.fire('Succès', 'Chambre modifiée avec succès', 'success');
            this.loadChambres();
          },
          error: (err) => {
            console.error('Erreur lors de la modification', err);
            Swal.fire('Erreur', 'Impossible de modifier la chambre', 'error');
          }
        });
      }
    });
  }

  // Supprimer une chambre
  supprimerChambre(chambre: Chambre): void {
    // Vérifier si la chambre a des lits occupés
    const litsOccupes = this.getLitsOccupes(chambre);

    if (litsOccupes > 0) {
      Swal.fire(
        'Impossible de supprimer',
        'Cette chambre a des lits occupés. Veuillez libérer tous les lits avant de supprimer.',
        'warning'
      );
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous supprimer la chambre ${chambre.numero}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.gestionChambreService.deleteChambre(chambre._id).subscribe({
          next: () => {
            Swal.fire('Supprimé!', 'La chambre a été supprimée.', 'success');
            this.loadChambres();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            Swal.fire('Erreur', 'Impossible de supprimer la chambre', 'error');
          }
        });
      }
    });
  }

  // Gérer les lits d'une chambre
 // Libérer un lit
libererLit(chambre: Chambre, numeroLit: number): void {
  Swal.fire({
    title: 'Confirmation',
    text: `Voulez-vous vraiment libérer le lit ${numeroLit} de la chambre ${chambre.numero}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Oui, libérer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.gestionChambreService.libererLit(chambre.numero, numeroLit).subscribe({
        next: () => {
          Swal.fire('Succès', 'Lit libéré avec succès', 'success');
          this.loadChambres();
        },
        error: (err) => {
          console.error('Erreur lors de la libération du lit', err);
          Swal.fire('Erreur', 'Impossible de libérer le lit', 'error');
        }
      });
    }
  });
}

// Assigner un lit à un patient
assignerLit(chambre: Chambre, numeroLit: number): void {
  Swal.fire({
    title: 'Assigner un patient',
    html: `
      <div class="form-group">
        <label for="patientId">ID du patient</label>
        <input id="patientId" type="text" class="swal2-input" placeholder="ID du patient">
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Assigner',
    cancelButtonText: 'Annuler',
    preConfirm: () => {
      const patientIdInput = document.getElementById('patientId') as HTMLInputElement;
      const patientId = patientIdInput ? patientIdInput.value : '';

      if (!patientId) {
        Swal.showValidationMessage('Veuillez entrer l\'ID du patient');
        return false;
      }

      return { patientId };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const { patientId } = result.value;

      this.gestionChambreService.assignerLit(chambre.numero, patientId, numeroLit).subscribe({
        next: () => {
          Swal.fire('Succès', 'Patient assigné avec succès', 'success');
          this.loadChambres();
        },
        error: (err) => {
          console.error('Erreur lors de l\'assignation du patient', err);
          let errorMsg = 'Erreur lors de l\'assignation du patient';

          if (err.error && err.error.message) {
            errorMsg = err.error.message;
          }

          Swal.fire('Erreur', errorMsg, 'error');
        }
      });
    }
  });
}
}