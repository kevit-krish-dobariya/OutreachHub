import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
           console.log('✅ User Payload:', res.user);
          localStorage.setItem('token', res.access_token);
          console.log('🔑 JWT Token:', res.access_token);// store token
          this.authService.setAuthData(res);
          this.router.navigate(['/dashboard']).then(success => {
            console.log('👉 Router navigation result:', success);
          }).catch(err => {
            console.error('❌ Router navigation error:', err);
          });  // redirect to portal
        },
        error: (err) => {
          this.errorMessage = 'Invalid username or password';
          console.error(err);
        }
      });
    }
  }
}
