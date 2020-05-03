
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

const JWT_LOCALSTORE_KEY = 'jwt';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.url.includes('filteredimage')) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${localStorage.getItem(JWT_LOCALSTORE_KEY)}`                }
            });
        }
        return next.handle(request);
    }
}
