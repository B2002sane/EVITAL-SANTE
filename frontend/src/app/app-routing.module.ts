// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard/default',
        pathMatch: 'full'
      },
      {
        path: 'dashboard/default',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/component/basic-component/color/color.component').then((c) => c.ColorComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/component/basic-component/typography/typography.component').then((c) => c.TypographyComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'rendez-vous',
        loadComponent: () =>
          import('./demo/rendez-vous/rendez-vous.component').then((c) => c.RendezVousComponent)
      },
      {
        path: 'patient',
        loadComponent: () =>
          import('./demo/patient/patient.component').then((c) => c.PatientComponent)
      },
      {
        path: 'personnel-medical',
        loadComponent: () =>
          import('./demo/personnel-medical/personnel-medical.component').then((c) => c.PersonnelMedicalComponent)
      },
      {
        path: 'ajout-personnel',
        loadComponent: () =>
          import('./demo/others/ajout-personnel/ajout-personnel.component').then((c) => c.AjoutPersonnelComponent)
      },
      {
        path: 'edit/personnel:id',
        loadComponent: () =>
          import('./demo/others/ajout-personnel/ajout-personnel.component').then((c) => c.AjoutPersonnelComponent)
      }
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      },
      {
        path: 'dashboard-donneur',
        loadComponent: () =>
          import('./demo/dashboard-donneur/dashboard-donneur.component').then((c) => c.DashboardDonneurComponent)
      },
      {
        path: 'login-donneur',
        loadComponent: () => import('./demo/pages/authentication/login-donneur/login-donneur.component').then((c) => c.LoginDonneurComponent)
      }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
