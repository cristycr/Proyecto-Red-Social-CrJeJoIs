import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
    inject,
    signal,
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { PutPasswordDto } from '../../models/put-password-dto';
import { PutUserDto } from '../../models/put-user-dto';
import { ToastService } from '../../services/toast';

@Component({
    selector: 'app-profile-edit',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './profile-edit.html',
    styleUrl: './profile-edit.css',
})
export class ProfileEdit implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly api = inject(ApiService);
    private readonly auth = inject(AuthService);
    private readonly toast = inject(ToastService);

    @ViewChild('avatarInput') private avatarInput?: ElementRef<HTMLInputElement>;
    @ViewChild('avatarMenuContainer')
    private avatarMenuContainer?: ElementRef<HTMLDivElement>;

    protected readonly loading = signal(true);
    protected readonly submitLoading = signal(false);
    protected readonly errorMessage = signal('');
    protected readonly avatarUrl = signal('/assets/images/avatar-default.png');
    protected readonly hasPrivateData = signal(false);
    protected readonly avatarMenuOpen = signal(false);
    protected readonly avatarActionLoading = signal(false);
    protected readonly avatarActionError = signal('');
    protected readonly checkingEmail = signal(false);
    protected readonly passwordSubmitLoading = signal(false);
    protected readonly passwordErrorMessage = signal('');

    private initialEmail = '';

    private readonly passwordMatchValidator = (
        form: AbstractControl
    ): ValidationErrors | null => {
        const password = form.get('password')?.value ?? '';
        const confirmPassword = form.get('confirmPassword')?.value ?? '';

        return password === confirmPassword ? null : { passwordsMismatch: true };
    };

    protected readonly profileForm = this.fb.group({
        nickname: [{ value: '', disabled: true }],
        email: ['', [Validators.required, Validators.email]],
        name: ['', [Validators.required, Validators.minLength(2)]],
        surname1: ['', [Validators.required, Validators.minLength(2)]],
        surname2: [''],
        biography: ['', [Validators.maxLength(280)]],
    });

    protected readonly passwordForm = this.fb.group(
        {
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        },
        { validators: this.passwordMatchValidator }
    );

    protected getFieldLabel(field: string): string {
        const labels: Record<string, string> = {
            email: 'Email',
            name: 'Nombre',
            surname1: 'Primer apellido',
            surname2: 'Segundo apellido',
            biography: 'Biografia',
        };

        return labels[field] ?? field;
    }

    protected shouldShowControlError(field: string): boolean {
        const control = this.profileForm.get(field);
        return Boolean(control?.touched && control.invalid);
    }

    protected getFieldErrorMessage(field: string): string {
        const control = this.profileForm.get(field);

        if (!control?.errors) {
            return '';
        }

        if (control.errors['required']) {
            return `${this.getFieldLabel(field)} es obligatorio.`;
        }

        if (control.errors['email']) {
            return 'Correo electronico invalido.';
        }

        if (control.errors['emailTaken']) {
            return 'Email ya en uso.';
        }

        if (control.errors['minlength']) {
            const min = control.errors['minlength'].requiredLength;
            return `${this.getFieldLabel(field)} debe tener minimo ${min} caracteres.`;
        }

        if (control.errors['maxlength']) {
            const max = control.errors['maxlength'].requiredLength;
            return `${this.getFieldLabel(field)} no puede superar ${max} caracteres.`;
        }

        return 'Campo invalido.';
    }

    protected shouldShowPasswordControlError(field: 'password' | 'confirmPassword'): boolean {
        const control = this.passwordForm.controls[field];
        return Boolean(control.touched && control.invalid);
    }

    protected getPasswordFieldErrorMessage(field: 'password' | 'confirmPassword'): string {
        const control = this.passwordForm.controls[field];

        if (!control.errors) {
            return '';
        }

        if (control.errors['required']) {
            return `${this.getPasswordFieldLabel(field)} es obligatorio.`;
        }

        if (control.errors['minlength']) {
            const min = control.errors['minlength'].requiredLength;
            return `${this.getPasswordFieldLabel(field)} debe tener minimo ${min} caracteres.`;
        }

        return 'Campo invalido.';
    }

    protected showPasswordMismatch(): boolean {
        const confirmControl = this.passwordForm.controls.confirmPassword;

        return (
            confirmControl.touched &&
            !confirmControl.hasError('required') &&
            this.passwordForm.hasError('passwordsMismatch')
        );
    }

    get biographyLength(): number {
        return this.profileForm.controls.biography.value?.length ?? 0;
    }

    ngOnInit(): void {
        void this.loadCurrentUserData();
    }

    protected async onEmailBlur(): Promise<void> {
        if (!this.profileForm.controls.email.touched) {
            this.profileForm.controls.email.markAsTouched();
        }

        await this.validateEmailUniqueness();
    }

    protected clearEmailTakenError(): void {
        const emailControl = this.profileForm.controls.email;
        const currentErrors = emailControl.errors;

        if (!currentErrors?.['emailTaken']) {
            return;
        }

        const { emailTaken, ...remainingErrors } = currentErrors;
        emailControl.setErrors(
            Object.keys(remainingErrors).length > 0 ? remainingErrors : null
        );
    }

    protected async onSubmit(): Promise<void> {
        this.errorMessage.set('');

        this.profileForm.markAllAsTouched();

        if (this.profileForm.invalid) {
            this.errorMessage.set('Revisa los campos del formulario antes de actualizar.');
            return;
        }

        const userId = this.auth.currentUserId();

        if (!userId) {
            this.errorMessage.set('No se pudo identificar el usuario autenticado.');
            return;
        }

        const isEmailAvailable = await this.validateEmailUniqueness();

        if (!isEmailAvailable) {
            this.errorMessage.set('Email ya en uso.');
            return;
        }

        const formValue = this.profileForm.getRawValue();

        const email = (formValue.email ?? '').trim();
        const name = (formValue.name ?? '').trim();
        const surname1 = (formValue.surname1 ?? '').trim();

        if (!email || !name || !surname1) {
            this.errorMessage.set('Email, nombre y primer apellido son obligatorios.');
            return;
        }

        const dto: PutUserDto = {
            email,
            name,
            surname1,
            surname2: formValue.surname2?.trim() || null,
            biography: formValue.biography?.trim() || null,
        };

        this.submitLoading.set(true);

        try {
            await this.api.updateUser(userId, dto);
            this.hasPrivateData.set(true);
            this.initialEmail = email.toLowerCase();

            this.toast.showSuccess('Datos actualizados correctamente.');
        } catch (err: any) {
            const backendMessage = this.extractBackendError(
                err,
                'No se pudo actualizar el perfil.'
            );

            if (this.looksLikeEmailTakenError(backendMessage)) {
                this.setEmailTakenError();
                this.profileForm.controls.email.markAsTouched();
                this.errorMessage.set('Email ya en uso.');
            } else {
                this.errorMessage.set(backendMessage);
            }
        } finally {
            this.submitLoading.set(false);
        }
    }

    protected async onPasswordSubmit(): Promise<void> {
        this.passwordErrorMessage.set('');

        this.passwordForm.markAllAsTouched();

        if (this.passwordForm.invalid) {
            this.passwordErrorMessage.set('Revisa los campos de la nueva contrasena.');
            return;
        }

        const userId = this.auth.currentUserId();

        if (!userId) {
            this.passwordErrorMessage.set('No se pudo identificar el usuario autenticado.');
            return;
        }

        const password = this.passwordForm.controls.password.value ?? '';

        if (!password) {
            this.passwordErrorMessage.set('La nueva contrasena es obligatoria.');
            return;
        }

        const dto: PutPasswordDto = { password };

        this.passwordSubmitLoading.set(true);

        try {
            await this.api.updatePassword(userId, dto);
            this.toast.showSuccess('Contrasena actualizada correctamente.');
            this.passwordForm.reset();
        } catch (err: any) {
            this.passwordErrorMessage.set(
                this.extractBackendError(err, 'No se pudo actualizar la contrasena.')
            );
        } finally {
            this.passwordSubmitLoading.set(false);
        }
    }

    protected toggleAvatarMenu(event: MouseEvent): void {
        event.stopPropagation();

        if (this.avatarActionLoading()) {
            return;
        }

        this.avatarMenuOpen.update((isOpen) => !isOpen);
    }

    protected triggerAvatarInput(event: MouseEvent): void {
        event.stopPropagation();
        this.avatarMenuOpen.set(false);
        this.avatarInput?.nativeElement.click();
    }

    protected async onAvatarSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            return;
        }

        const file = input.files[0];
        this.avatarActionLoading.set(true);
        this.avatarActionError.set('');

        try {
            const result = await this.api.uploadAvatar(file);
            this.avatarUrl.set(this.buildAvatarUrl(result.avatarUrl));
        } catch (err: any) {
            this.avatarActionError.set(
                this.extractBackendError(err, 'No se pudo cambiar la foto de perfil.')
            );
        } finally {
            this.avatarActionLoading.set(false);
            this.avatarMenuOpen.set(false);
            input.value = '';
        }
    }

    protected async removeAvatar(event: MouseEvent): Promise<void> {
        event.stopPropagation();
        this.avatarMenuOpen.set(false);

        if (this.avatarActionLoading()) {
            return;
        }

        this.avatarActionLoading.set(true);
        this.avatarActionError.set('');

        try {
            await this.api.deleteAvatar();
            this.avatarUrl.set('/assets/images/avatar-default.png');
        } catch (err: any) {
            this.avatarActionError.set(
                this.extractBackendError(err, 'No se pudo eliminar la foto de perfil.')
            );
        } finally {
            this.avatarActionLoading.set(false);
        }
    }

    @HostListener('document:click', ['$event'])
    protected onDocumentClick(event: MouseEvent): void {
        if (!this.avatarMenuOpen()) {
            return;
        }

        const container = this.avatarMenuContainer?.nativeElement;
        const target = event.target as Node | null;

        if (!container || !target) {
            this.avatarMenuOpen.set(false);
            return;
        }

        if (!container.contains(target)) {
            this.avatarMenuOpen.set(false);
        }
    }

    private async loadCurrentUserData(): Promise<void> {
        this.loading.set(true);
        this.errorMessage.set('');

        const userId = this.auth.currentUserId();

        if (!userId) {
            this.errorMessage.set('No se pudo identificar el usuario autenticado.');
            this.profileForm.patchValue({
                nickname: this.auth.nickname(),
                biography: this.auth.biography(),
            });
            this.avatarUrl.set(this.buildAvatarUrl(this.auth.profileImage()));
            this.loading.set(false);
            return;
        }

        const [publicProfileResult, extendedProfileResult] = await Promise.allSettled([
            this.api.getUserProfileById(userId),
            this.api.getUserProfileExtendById(userId),
        ]);

        const publicProfile =
            publicProfileResult.status === 'fulfilled' ? publicProfileResult.value : null;
        const extendedProfile =
            extendedProfileResult.status === 'fulfilled' ? extendedProfileResult.value : null;

        const nickname = this.toText(publicProfile?.nickname) || this.auth.nickname();
        const biographyFromExtended = this.toText(extendedProfile?.biography);
        const biographyFromPublic = this.toText(publicProfile?.biography);

        const email = this.toText(extendedProfile?.email);
        const name = this.toText(extendedProfile?.name);
        const surname1 = this.toText(extendedProfile?.surname1);
        const surname2 = this.toText(extendedProfile?.surname2);

        this.initialEmail = email.toLowerCase();
        this.clearEmailTakenError();

        this.profileForm.patchValue({
            nickname,
            email,
            name,
            surname1,
            surname2,
            biography: biographyFromExtended || biographyFromPublic || this.auth.biography(),
        });

        this.hasPrivateData.set(Boolean(email || name || surname1 || surname2));
        this.avatarUrl.set(
            this.buildAvatarUrl(publicProfile?.avatarPath || this.auth.profileImage())
        );

        if (
            publicProfileResult.status === 'rejected' &&
            extendedProfileResult.status === 'rejected'
        ) {
            this.errorMessage.set('No se pudieron cargar los datos del perfil.');
        } else if (extendedProfileResult.status === 'rejected') {
            this.errorMessage.set(
                'No se pudieron cargar email, nombre y apellidos. El resto de datos sigue disponible.'
            );
        }

        this.loading.set(false);
    }

    private toText(value: unknown): string {
        return typeof value === 'string' ? value.trim() : '';
    }

    private getPasswordFieldLabel(field: 'password' | 'confirmPassword'): string {
        const labels: Record<'password' | 'confirmPassword', string> = {
            password: 'Nueva contrasena',
            confirmPassword: 'Repetir contrasena',
        };

        return labels[field];
    }

    private async validateEmailUniqueness(): Promise<boolean> {
        const emailControl = this.profileForm.controls.email;
        const email = (emailControl.value ?? '').trim().toLowerCase();

        this.clearEmailTakenError();

        if (!email || emailControl.hasError('required') || emailControl.hasError('email')) {
            return true;
        }

        if (email === this.initialEmail) {
            return true;
        }

        this.checkingEmail.set(true);

        try {
            const emailExists = await this.api.getUserByEmail(email);

            if (emailExists) {
                this.setEmailTakenError();
                return false;
            }

            return true;
        } catch (err: any) {
            this.errorMessage.set(
                this.extractBackendError(
                    err,
                    'No se pudo comprobar si el email ya existe. Intentalo de nuevo.'
                )
            );

            return false;
        } finally {
            this.checkingEmail.set(false);
        }
    }

    private setEmailTakenError(): void {
        const emailControl = this.profileForm.controls.email;
        const currentErrors = emailControl.errors ?? {};

        emailControl.setErrors({
            ...currentErrors,
            emailTaken: true,
        });
    }

    private looksLikeEmailTakenError(message: string): boolean {
        const normalizedMessage = message.trim().toLowerCase();

        if (normalizedMessage === 'email') {
            return true;
        }

        return (
            normalizedMessage.includes('email') &&
            (
                normalizedMessage.includes('uso') ||
                normalizedMessage.includes('used') ||
                normalizedMessage.includes('existe') ||
                normalizedMessage.includes('exist') ||
                normalizedMessage.includes('duplic')
            )
        );
    }

    private extractBackendError(err: any, fallbackMessage: string): string {
        return (
            (typeof err?.error === 'string' ? err.error : null) ||
            err?.error?.error ||
            err?.error?.message ||
            err?.message ||
            fallbackMessage
        );
    }

    private buildAvatarUrl(avatarPath: string | null | undefined): string {
        const cleanAvatarPath = avatarPath?.trim();

        if (!cleanAvatarPath) {
            return '/assets/images/avatar-default.png';
        }

        if (
            cleanAvatarPath.startsWith('http://') ||
            cleanAvatarPath.startsWith('https://') ||
            cleanAvatarPath.startsWith('/assets/')
        ) {
            return cleanAvatarPath;
        }

        if (cleanAvatarPath.startsWith('/uploads/')) {
            return `https://localhost:7185${cleanAvatarPath}`;
        }

        if (cleanAvatarPath.startsWith('uploads/')) {
            return `https://localhost:7185/${cleanAvatarPath}`;
        }

        return `https://localhost:7185/uploads/${cleanAvatarPath}`;
    }
}
