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
    let head = '';
    let detail = '';

    if(err.status == 500){
      head =  err.error.status + '  Server Error : ' + err.error.error 
      detail =  ' Detail : ' + err.error.message 
    }else if(err.status == 404){
      head =  err.error.status + '  Not found path Server : ' + err.error.error 
      detail =  ' Detail : ' + err.error.message 
    }else if(err.status == 400){
      head =  err.error.status + ' Request Bad Server : ' + err.error.error 
      detail =  ' Detail : ' + err.error.message 
    }else if([401, 403].includes(err.status)){
      head =  err.error.status + ' Permission Server : ' + err.error.error 
      detail =  ' Detail : ' + err.error.message 
    }

    let textHtml = '<b>' + head + '</b>' + '<p>' + '<b> Detail : </b>' + detail + '</p>'

    Swal.fire({
      title: "<strong>กรุณาติดต่อ Admin!</strong>",
      icon: "error",
      html: textHtml,
      showCloseButton: false,
      showCancelButton: false,
      focusConfirm: true,
      allowOutsideClick: false,
      confirmButtonText: 'ตกลง',
      heightAuto: false,
    }).then(res=>{
      if(res.isConfirmed){
        sessionStorage.removeItem("userData")
        this.sharing.userData.next(true);
        this.router.navigate(['/auth/signin']);
      }
    });

    // Swal.fire({
    //   icon: "error",
    //   title: "กรุณาติดต่อ Admin!",
    //   text: text,
    //   confirmButtonText: 'ตกลง',
    //   heightAuto: false,
    // })
  }

}
