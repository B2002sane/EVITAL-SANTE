import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { NavRightComponent } from '../../theme/layouts/admin-layout/nav-bar/nav-right/nav-right.component';


@Component({
  selector: 'app-dashboard-donneur',
  imports: [ CommonModule ],
  templateUrl: './dashboard-donneur.component.html',
  styleUrl: './dashboard-donneur.component.scss'
})
export class DashboardDonneurComponent {


  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  demandes = [
    { date: '10/02/2025', groupe: 'O+', acceptee: false },
    { date: '10/02/2025', groupe: 'A+', acceptee: false },
    { date: '10/02/2025', groupe: 'O-', acceptee: false },
    { date: '10/02/2025', groupe: 'O-', acceptee: false },
  ];

  accepterDemande(demande: any) {
    demande.acceptee = true;
  }



}
