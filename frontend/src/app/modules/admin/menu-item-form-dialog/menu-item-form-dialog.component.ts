import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MenuItemsService } from 'src/app/services/menu-items.service';

export interface MenuItem {
  id?: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
  ingredientes?: string[];
  tags?: string[];
  has_image?: boolean;
  image_url?: string;
}

export interface DialogData {
  mode: 'create' | 'edit';
  item?: MenuItem;
}

@Component({
  selector: 'app-menu-item-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './menu-item-form-dialog.component.html',
  styleUrls: ['./menu-item-form-dialog.component.scss']
})
export class MenuItemFormDialogComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isEditMode = false;
  isDragOver = false;
  uploadProgress: number | null = null;

  categories = [
    { value: 'lanche', label: 'Lanche' },
    { value: 'bebida', label: 'Bebida' },
    { value: 'sobremesa', label: 'Sobremesa' },
    { value: 'petisco', label: 'Petisco' }
  ];

  constructor(
    private fb: FormBuilder,
    private menuItemsService: MenuItemsService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<MenuItemFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.item) {
      this.populateForm(this.data.item);
    }
  }

  createForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      descricao: ['', Validators.maxLength(500)],
      preco: ['', [Validators.required, Validators.min(0.01)]],
      categoria: ['', Validators.required],
      ingredientes: [''],
      tags: [''],
      disponivel: [true]
    });
  }

  populateForm(item: MenuItem): void {
    this.form.patchValue({
      nome: item.nome,
      descricao: item.descricao,
      preco: item.preco,
      categoria: item.categoria,
      ingredientes: item.ingredientes ? item.ingredientes.join(', ') : '',
      tags: item.tags ? item.tags.join(', ') : '',
      disponivel: item.disponivel
    });

    // Carregar imagem existente se houver
    if (item.has_image && item.image_url) {
      this.imagePreview = `http://localhost:3002${item.image_url}`;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File): void {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Apenas arquivos de imagem são permitidos', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('O arquivo deve ter no máximo 5MB', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.selectedFile = file;
    this.uploadProgress = 0;

    // Simular progresso de upload
    const progressInterval = setInterval(() => {
      if (this.uploadProgress !== null && this.uploadProgress < 100) {
        this.uploadProgress += Math.random() * 30;
        if (this.uploadProgress > 100) {
          this.uploadProgress = 100;
        }
      } else {
        clearInterval(progressInterval);
        // Criar preview após "upload" completo
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview = e.target.result;
          this.uploadProgress = null;
          this.snackBar.open('Imagem carregada com sucesso!', 'Fechar', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        };
        reader.readAsDataURL(file);
      }
    }, 200);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadProgress = null;
    
    // Reset file input
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    const fileInput2 = document.getElementById('imageInput2') as HTMLInputElement;
    if (fileInput2) {
      fileInput2.value = '';
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      const formValues = this.form.value;

      // Se não há imagem, enviar JSON simples
      if (!this.selectedFile) {
        const itemData = {
          nome: formValues.nome,
          descricao: formValues.descricao || '',
          preco: parseFloat(formValues.preco),
          categoria: formValues.categoria,
          disponivel: formValues.disponivel
        };

        const request = this.isEditMode && this.data.item?.id
          ? this.menuItemsService.update(this.data.item.id, itemData)
          : this.menuItemsService.createSimple(itemData);

        request.subscribe({
          next: (response: any) => {
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: (error: any) => {
            console.error('Erro ao salvar item:', error);
            this.loading = false;
            this.snackBar.open('Erro ao salvar item. Tente novamente.', 'Fechar', {
              duration: 4000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        // Se há imagem, usar FormData
        const formData = new FormData();
        formData.append('nome', formValues.nome);
        formData.append('descricao', formValues.descricao || '');
        formData.append('preco', formValues.preco.toString());
        formData.append('categoria', formValues.categoria);
        formData.append('disponivel', formValues.disponivel.toString());

        // Adicionar imagem
        formData.append('image', this.selectedFile);

        console.log('🔍 [FRONTEND] Enviando FormData com imagem');
        console.log('🔍 [FRONTEND] selectedFile:', this.selectedFile);
        console.log('🔍 [FRONTEND] isEditMode:', this.isEditMode);
        console.log('🔍 [FRONTEND] item id:', this.data.item?.id);

        const request = this.isEditMode && this.data.item?.id
          ? this.menuItemsService.update(this.data.item.id, formData)
          : this.menuItemsService.create(formData);

        request.subscribe({
          next: (response: any) => {
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: (error: any) => {
            console.error('Erro ao salvar item:', error);
            this.loading = false;
            this.snackBar.open('Erro ao salvar item. Tente novamente.', 'Fechar', {
              duration: 4000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getTitle(): string {
    return this.isEditMode ? 'Editar Item do Menu' : 'Adicionar Item ao Menu';
  }

  getSubmitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  // Método para acessar elementos do DOM
  clickImageInput(inputId: string): void {
    const element = document.getElementById(inputId);
    if (element) {
      element.click();
    }
  }

  onImageError(event: any): void {
    console.error('Erro ao carregar imagem:', event);
    this.imagePreview = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}