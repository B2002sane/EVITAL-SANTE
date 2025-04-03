import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Récupérer le token directement depuis localStorage, comme dans LoginService
    const token = localStorage.getItem('token');
    
    console.log('Intercepteur - URL:', req.url);
    console.log('Intercepteur - Token récupéré:', !!token);
    
    if (token) {
      // Cloner la requête et ajouter l'en-tête d'autorisation
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Intercepteur - En-tête Authorization ajouté');
      return next.handle(cloned);
    } else {
      console.log('Intercepteur - Aucun token trouvé, requête originale envoyée');
      return next.handle(req);
    }
  }
}