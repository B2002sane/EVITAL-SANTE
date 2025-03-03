import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Définition de l'interface Chambre avec information sur les lits assignés
interface Chambre {
  id: string;
  numero: string;
  statut: string;
  lits: number;
  litsAssignes: number; // Nombre de lits assignés
}

@Component({
  selector: 'app-gestion-chambre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-chambre.component.html',
  styleUrls: ['./gestion-chambre.component.scss']
})
export class GestionChambreComponent implements OnInit {
  chambres: Chambre[] = [];

  constructor() { }

  ngOnInit(): void {
    // Charger les données des chambres
    this.loadChambres();
  }

  loadChambres(): void {
    // Mise à jour des données avec le champ "litsAssignes"
    this.chambres = [
      { id: '1', numero: '01', statut: 'Libre', lits: 3, litsAssignes: 0 },
      { id: '2', numero: '02', statut: 'Partiellement occupée', lits: 2, litsAssignes: 1 },
      { id: '3', numero: '03', statut: 'Libre', lits: 1, litsAssignes: 0 },
      { id: '4', numero: '04', statut: 'Occupée', lits: 4, litsAssignes: 4 },
      { id: '5', numero: '05', statut: 'Partiellement occupée', lits: 3, litsAssignes: 2 },
      { id: '6', numero: '06', statut: 'Occupée', lits: 2, litsAssignes: 2 },
      { id: '7', numero: '07', statut: 'Libre', lits: 3, litsAssignes: 0 }
    ];
  }

  // Mise à jour du statut en fonction des lits assignés
  updateStatut(chambre: Chambre): string {
    if (chambre.litsAssignes === 0) {
      return 'Libre';
    } else if (chambre.litsAssignes < chambre.lits) {
      return 'Partiellement occupée';
    } else {
      return 'Occupée';
    }
  }

  // Voir les détails d'une chambre
  voirChambre(chambre: Chambre): void {
    Swal.fire({
      title: `Chambre ${chambre.numero}`,
      html: `
        <div>
          <p><strong>Statut:</strong> ${chambre.statut}</p>
          <p><strong>Nombre de lits:</strong> ${chambre.lits}</p>
          <p><strong>Lits assignés:</strong> ${chambre.litsAssignes} / ${chambre.lits}</p>
        </div>
      `,
      confirmButtonText: 'Fermer'
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
          <label for="lits">Nombre de lits</label>
          <input id="lits" type="number" class="swal2-input" placeholder="Lits" min="1">
        </div>
        <div class="form-group">
          <label for="litsAssignes">Lits assignés</label>
          <input id="litsAssignes" type="number" class="swal2-input" placeholder="Lits assignés" min="0" value="0">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ajouter',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const numero = (document.getElementById('numero') as HTMLInputElement).value;
        const lits = parseInt((document.getElementById('lits') as HTMLInputElement).value);
        const litsAssignes = parseInt((document.getElementById('litsAssignes') as HTMLInputElement).value);
        
        if (!numero || isNaN(lits) || isNaN(litsAssignes)) {
          Swal.showValidationMessage('Veuillez remplir tous les champs correctement');
          return false;
        }
        
        // Vérification que litsAssignes ne dépasse pas lits
        if (litsAssignes > lits) {
          Swal.showValidationMessage('Le nombre de lits assignés ne peut pas dépasser le nombre total de lits');
          return false;
        }
        
        return { numero, lits, litsAssignes };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { numero, lits, litsAssignes } = result.value;
        
        // Générer un ID unique
        const id = (this.chambres.length + 1).toString();
        
        // Déterminer le statut
        const statut = litsAssignes === 0 ? 'Libre' : 
                        litsAssignes < lits ? 'Partiellement occupée' : 'Occupée';
        
        // Ajouter la nouvelle chambre
        this.chambres.push({
          id,
          numero,
          statut,
          lits,
          litsAssignes
        });
        
        Swal.fire('Succès', 'Chambre ajoutée avec succès', 'success');
      }
    });
  }

  // Modifier une chambre existante
  modifierChambre(chambre: Chambre): void {
    Swal.fire({
      title: 'Modifier la chambre',
      html: `
        <div class="form-group">
          <label for="numero">Numéro de chambre</label>
          <input id="numero" type="text" class="swal2-input" value="${chambre.numero}">
        </div>
        <div class="form-group">
          <label for="lits">Nombre de lits</label>
          <input id="lits" type="number" class="swal2-input" value="${chambre.lits}" min="1">
        </div>
        <div class="form-group">
          <label for="litsAssignes">Lits assignés</label>
          <input id="litsAssignes" type="number" class="swal2-input" value="${chambre.litsAssignes}" min="0">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Modifier',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const numero = (document.getElementById('numero') as HTMLInputElement).value;
        const lits = parseInt((document.getElementById('lits') as HTMLInputElement).value);
        const litsAssignes = parseInt((document.getElementById('litsAssignes') as HTMLInputElement).value);
        
        if (!numero || isNaN(lits) || isNaN(litsAssignes)) {
          Swal.showValidationMessage('Veuillez remplir tous les champs correctement');
          return false;
        }
        
        // Vérification que litsAssignes ne dépasse pas lits
        if (litsAssignes > lits) {
          Swal.showValidationMessage('Le nombre de lits assignés ne peut pas dépasser le nombre total de lits');
          return false;
        }
        
        return { numero, lits, litsAssignes };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { numero, lits, litsAssignes } = result.value;
        
        // Déterminer le statut
        const statut = litsAssignes === 0 ? 'Libre' : 
                        litsAssignes < lits ? 'Partiellement occupée' : 'Occupée';
        
        // Mettre à jour la chambre
        const index = this.chambres.findIndex(c => c.id === chambre.id);
        if (index !== -1) {
          this.chambres[index] = {
            ...this.chambres[index],
            numero,
            statut,
            lits,
            litsAssignes
          };
          
          Swal.fire('Succès', 'Chambre modifiée avec succès', 'success');
        }
      }
    });
  }

  // Supprimer une chambre
  supprimerChambre(chambre: Chambre): void {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous supprimer la chambre ${chambre.numero}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Supprimer la chambre
        this.chambres = this.chambres.filter(c => c.id !== chambre.id);
        
        Swal.fire('Supprimé!', 'La chambre a été supprimée.', 'success');
      }
    });
  }
}