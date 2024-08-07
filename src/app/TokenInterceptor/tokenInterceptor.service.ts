import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { SharingService } from '../SharingService';


@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor{

  constructor(private router: Router,private sharing : SharingService,) { }

  userData : any

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    var userDetailSession : any = sessionStorage.getItem("userData")
    this.userData = JSON.parse(userDetailSession)

    if(this.userData){
      let accessToken  = this.userData.accessToken;
      if (accessToken) {
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + accessToken,
          },
        });
        // this.tokenExpire()
      }
    }
    return next.handle(request).pipe(
    catchError((err) => {
      console.log("error=>",err)
        if ([401, 403].includes(err.status)) {
          this.errorSwal(err)
        }else if([500, 404,400].includes(err.status)){
          console.log(err)
          this.errorSwal(err)
        }
        const error = err.error.message || err.statusText;
        return throwError(() => error);
      })
    );
  }

  errorSwal(err : any){
    Swal.fire({
      icon: "error",
      title: "กรุณาติดต่อ Admin!",
      text: err.error.status + " : " +err.error.error + " : " + err.error.message,
      confirmButtonText: 'ตกลง',
      heightAuto: false,
    }).then(res=>{
      if(res.isConfirmed){
        sessionStorage.removeItem("userData")
        this.sharing.userData.next(true);
        this.router.navigate(['/auth/signin']);
      }
    });
  }

}
