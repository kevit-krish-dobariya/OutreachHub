import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  isDarkMode = false;
  private themeSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
  ) {
    this.signupForm = this.fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  // ✅ Password match validator
  passwordsMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // ✅ Toggle password visibility
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ✅ Form submit
  onSubmit() {
    if (this.signupForm.valid) {
      const { confirmPassword, ...userData } = this.signupForm.value;

      // assign default role
      const payload = {
        ...userData,
        role: 'viewer'
      };

      this.authService.signup(payload).subscribe({
        next: () => {
          this.router.navigate(['/auth/login']); // redirect to login
        },
        error: (err) => {
          this.errorMessage = 'Signup failed. Try again!';
          console.error('Signup error:', err);
        }
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

   ngOnInit(){
    
     // Subscribe to theme changes to update the icon
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = (theme === 'dark');
      });
  }

   ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  /**
   * Toggles the application's theme between light and dark mode.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
