import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/service/auth.service';
import { ThemeService } from '../../core/service/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  isDarkMode = false;
  loginError: string | null = null; // To hold and display login error messages
  private themeSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      // Added email validator for username to guide user input
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Subscribes to theme changes to update the sun/moon icon
    this.themeSubscription = this.themeService.currentTheme$.subscribe(
      (theme) => {
        this.isDarkMode = theme === 'dark';
      }
    );
  }

  ngOnDestroy(): void {
    // Prevents memory leaks by unsubscribing when the component is destroyed
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  /**
   * Toggles the theme between light and dark mode.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Provides form validation error messages to the template.
   */
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.touched && control?.hasError('required')) {
      return `${
        controlName.charAt(0).toUpperCase() + controlName.slice(1)
      } is required.`;
    }
    return '';
  }

  /**
   * Handles the login form submission.
   */
  onSubmit(): void {
    // Reset previous errors and mark fields as touched to show validation messages
    this.loginError = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        console.log('Login successful!', response);
        // The AuthService's tap operator handles storing the token.
        // Navigate based on the role received from the backend.
        if (response.role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          // You can redirect other roles to a different portal if needed
          this.router.navigate(['/dashboard']); // Default redirect
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.loginError =
          'Invalid username or password. Please try again.';
        this.isLoading = false; // Ensure loading state is turned off on error
      },
      complete: () => {
        this.isLoading = false; // Ensure loading state is turned off on completion
      },
    });
  }
}
