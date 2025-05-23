import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
  dispalyName: string;
  email: string;
  token: string;
  role: string;
}

export interface RegisterDto {
  dispalyName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = 'http://localhost:5229/api/account';

  constructor(private http: HttpClient) { }

  register(model: RegisterDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.baseUrl}/Register`, model);
  }

  login(model: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.baseUrl}/Login`, model);
  }
}