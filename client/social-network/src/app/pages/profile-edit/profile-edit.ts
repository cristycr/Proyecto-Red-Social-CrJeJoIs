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
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
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
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    @ViewChild('avatarInput') private avatarInput?: ElementRef<HTMLInputElement>;
    @ViewChild('avatarMenuContainer')
    private avatarMenuContainer?: ElementRef<HTMLDivElement>;

    protected readonly loading = signal(true);
    protected readonly submitLoading = signal(false);
    protected readonly errorMessage = signal('');
    protected readonly submitMessage = signal('');
    protected readonly avatarUrl = signal('/assets/images/avatar-default.png');
    protected readonly hasPrivateData = signal(false);
    protected readonly avatarMenuOpen = signal(false);
    protected readonly avatarActionLoading = signal(false);
    protected readonly avatarActionError = signal('');
    protected readonly checkingEmail = signal(false);

    private initialEmail = '';

    private readonly passwordMatchValidator = (
        form: AbstractControl
    ): ValidationErrors | null => {
        const password = form.get('password')?.value ?? '';
        const confirmPassword = form.get('confirmPassword')?.value ?? '';

        return password === confirmPassword ? null : { passwordsMismatch: true };
    };

    protected readonly profileForm = this.fb.group(
        {
            nickname: [{ value: '', disabled: true }],
            email: ['', [Validators.required, Validators.email]],
            name: ['', [Validators.required, Validators.minLength(2)]],
            surname1: ['', [Validators.required, Validators.minLength(2)]],
            surname2: [''],
            biography: ['', [Validators.maxLength(280)]],
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
            password: 'Contrasena',
            confirmPassword: 'Confirmar contrasena',
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
            return 'Este correo electronico ya existe en la base de datos.';
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

    protected showPasswordMismatch(): boolean {
        const confirmControl = this.profileForm.controls.confirmPassword;

        return (
            confirmControl.touched &&
            !confirmControl.hasError('required') &&
            this.profileForm.hasError('passwordsMismatch')
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
        this.submitMessage.set('');
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
            this.errorMessage.set('El email introducido ya existe en la base de datos.');
            return;
        }

        const formValue = this.profileForm.getRawValue();
        const password = formValue.password ?? '';

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
            password,
        };

        this.submitLoading.set(true);

        try {
            await this.api.updateUser(userId, dto);
            this.submitMessage.set('Perfil actualizado correctamente.');
            this.hasPrivateData.set(true);
            this.initialEmail = email.toLowerCase();
            this.profileForm.patchValue({
                password: '',
                confirmPassword: '',
            });

            this.toast.showSuccess('Datos actualizados correctamente.');
            await this.router.navigate(['/profile']);
        } catch (err: any) {
            const backendMessage = this.extractBackendError(
                err,
                'No se pudo actualizar el perfil.'
            );

            if (this.looksLikeEmailTakenError(backendMessage)) {
                this.setEmailTakenError();
                this.profileForm.controls.email.markAsTouched();
                this.errorMessage.set('El email introducido ya existe en la base de datos.');
            } else {
                this.errorMessage.set(backendMessage);
            }
        } finally {
            this.submitLoading.set(false);
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
        this.submitMessage.set('');

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
            password: '',
            confirmPassword: '',
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
        const normalizedMessage = message.toLowerCase();

        return (
            normalizedMessage.includes('email') &&
            (
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
