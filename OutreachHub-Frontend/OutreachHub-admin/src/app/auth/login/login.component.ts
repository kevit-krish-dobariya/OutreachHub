import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

    getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName} is required`;
    }
    if (control?.hasError('email')) {
      return 'Invalid Username format';
    }
    if (control?.hasError('minlength')) {
      return `${controlName} must be at least 6 characters`;
    }
    return '';
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.auth.login({ username, password }).subscribe({
  next: (res) => {
    this.auth.setToken(res.access_token);
    // redirect, show success message, etc.
     this.router.navigate(['/dashboard']).then(success => {
              console.log('👉 Router navigation result:', success);
            }).catch(err => {
              console.error('❌ Router navigation error:', err);
            });

  },
  error: (err) => {
    console.error('Login failed', err);
  }
});
  }
}
