import { Component, OnInit } from '@angular/core';
import { RendezVousService, RendezVous } from '../../service/rendez-vous.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rendez-vous',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rendez-vous.component.html',
  styleUrls: ['./rendez-vous.component.scss']
})
export class RendezVousComponent implements OnInit {
  allRendezVous: RendezVous[] = [];
  rendezVousAffiches: RendezVous[] = [];
  
  // Filtres
  dateFilter: string = '';
  statusFilter: string = '';
  periodeFilter: string = '';
  
  // Pagination
  pageActuelle: number = 1;
  itemsParPage: number = 6;
  totalPages: number = 1;

  constructor(private rendezVousService: RendezVousService) {}

  ngOnInit(): void {
    this.loadAllRendezVous();
  }

  /** Récupérer tous les rendez-vous **/
  loadAllRendezVous(): void {
    this.rendezVousService.getAll().subscribe({
      next: (response) => {
        this.allRendezVous = response.rendezVous;
        this.appliquerFiltres();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous', error);
      }
    });
  }

  /** Appliquer les filtres sur les rendez-vous **/
  appliquerFiltres(): void {
    let resultatsFiltres = [...this.allRendezVous];

    // Filtre par date
    if (this.dateFilter) {
      const dateRecherche = new Date(this.dateFilter);
      resultatsFiltres = resultatsFiltres.filter(rdv => {
        const dateRdv = new Date(rdv.date);
        return dateRdv.toDateString() === dateRecherche.toDateString();
      });
    }

    // Filtre par statut
    if (this.statusFilter) {
      resultatsFiltres = resultatsFiltres.filter(rdv => rdv.status === this.statusFilter);
    }

    // Filtre par période
    if (this.periodeFilter) {
      const maintenant = new Date();
      const dateDebut = new Date();
      
      if (this.periodeFilter === 'jour') {
        // Aujourd'hui
      } else if (this.periodeFilter === 'semaine') {
        // Première jour de la semaine
        dateDebut.setDate(maintenant.getDate() - maintenant.getDay());
      } else if (this.periodeFilter === 'mois') {
        // Premier jour du mois
        dateDebut.setDate(1);
      }
      
      resultatsFiltres = resultatsFiltres.filter(rdv => {
        const dateRdv = new Date(rdv.date);
        return dateRdv >= dateDebut && dateRdv <= maintenant;
      });
    }

    // Appliquer la pagination
    this.totalPages = Math.ceil(resultatsFiltres.length / this.itemsParPage);
    const debut = (this.pageActuelle - 1) * this.itemsParPage;
    const fin = debut + this.itemsParPage;
    this.rendezVousAffiches = resultatsFiltres.slice(debut, fin);
  }

  /** Filtrer uniquement par statut (pour le bouton Demandes en Attente) **/
  filtrerParStatus(status: string): void {
    this.statusFilter = status;
    this.pageActuelle = 1;
    this.appliquerFiltres();
  }

  /** Changer de page **/
  changerPage(page: number): void {
    this.pageActuelle = page;
    this.appliquerFiltres();
  }

  /** Obtenir le libellé du statut **/
  getStatusLabel(status: string): string {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'confirme': return 'Confirmé';
      case 'annule': return 'Annulé';
      case 'termine': return 'Terminé';
      default: return status;
    }
  }







  /** Accepter un rendez-vous en attente **/
  accepterRendezVous(rdvId: string): void {
    // Affichage d'une boîte de dialogue de confirmation
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous vraiment accepter ce rendez-vous ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
      reverseButtons: true
    }).then((result) => {
      // Si l'utilisateur confirme
      if (result.isConfirmed) {
        this.rendezVousService.acceptRequest(rdvId).subscribe({
          next: (response) => {
            console.log('Rendez-vous accepté:', response.message);
            
            // Mettre à jour le statut dans la liste locale
            this.updateRendezVousStatus(rdvId, 'confirme');
            
            // Rafraîchir la liste
            this.loadAllRendezVous();

            // Affichage d'un message de succès
            Swal.fire('Succès!', 'Rendez-vous accepté avec succès!', 'success');
          },
          error: (error) => {
            console.error('Erreur lors de l\'acceptation du rendez-vous', error);
            // Affichage d'un message d'erreur en cas d'échec
            Swal.fire('Erreur!', 'Impossible d\'accepter ce rendez-vous.', 'error');
          }
        });
      } else {
        // Si l'utilisateur annule l'action
        Swal.fire('Annulé', 'Le rendez-vous n\'a pas été accepté.', 'info');
      }
    });
  }




      
    /** Annuler un rendez-vous **/
    annulerRendezVous(rdvId: string): void {
      // Affichage d'une boîte de dialogue de confirmation
      Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Voulez-vous vraiment annuler ce rendez-vous ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui',
        cancelButtonText: 'Non',
        reverseButtons: true
      }).then((result) => {
        // Si l'utilisateur confirme
        if (result.isConfirmed) {
          // Appeler le service pour annuler le rendez-vous
          this.rendezVousService.update(rdvId, { status: 'annule' }).subscribe({
            next: (response) => {
              console.log('Rendez-vous annulé');
              
              // Mettre à jour le statut dans la liste locale
              this.updateRendezVousStatus(rdvId, 'annule');
              
              // Rafraîchir la liste
              this.loadAllRendezVous();

              // Affichage d'un message de succès
              Swal.fire('Succès!', 'Le rendez-vous a été annulé avec succès!', 'success');
            },
            error: (error) => {
              console.error('Erreur lors de l\'annulation du rendez-vous', error);
              // Affichage d'un message d'erreur en cas d'échec
              Swal.fire('Erreur!', 'Impossible d\'annuler ce rendez-vous.', 'error');
            }
          });
        } else {
          // Si l'utilisateur annule l'action
          Swal.fire('Annulé', 'Le rendez-vous n\'a pas été annulé.', 'info');
        }
      });
    }




  /** Mettre à jour le statut d'un rendez-vous dans les listes locales **/
  private updateRendezVousStatus(rdvId: string, newStatus: 'confirme' | 'annule' | 'termine'): void {
    // Mettre à jour dans la liste complète
    const rdvIndex = this.allRendezVous.findIndex(rdv => rdv.id === rdvId);
    if (rdvIndex !== -1) {
      this.allRendezVous[rdvIndex].status = newStatus;
    }
    
    // Mettre à jour dans la liste affichée
    const rdvAfficheIndex = this.rendezVousAffiches.findIndex(rdv => rdv.id === rdvId);
    if (rdvAfficheIndex !== -1) {
      this.rendezVousAffiches[rdvAfficheIndex].status = newStatus;
    }
  }





}