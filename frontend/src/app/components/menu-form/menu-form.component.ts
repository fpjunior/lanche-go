import { Component, OnInit, Input, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { ImageService } from '../../services/image.service';
import { MenuItem } from '../../modules/clientes/models/menu.model';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    ImageUploadComponent
  ],
  template: `
    <form [formGroup]="menuForm" (ngSubmit)="onSubmit()" class="menu-form">
      <h2>{{ isEditing ? 'Editar' : 'Novo' }} Item do Menu</h2>

      <!-- Upload de Imagem -->
      <div class="form-section">
        <h3>Imagem do Produto</h3>
        <app-image-upload
          [currentImageUrl]="currentImageUrl"
          [allowRemove]="true"
          uploadText="Adicionar imagem do produto"
          altText="Imagem do produto"
          (imageUploaded)="onImageUploaded($event)"
          (imageRemoved)="onImageRemoved()">
        </app-image-upload>
      </div>

      <!-- Informações Básicas -->
      <div class="form-section">
        <mat-form-field appearance="outline">
          <mat-label>Nome do Produto</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Hambúrguer Clássico">
          <mat-error *ngIf="menuForm.get('nome')?.hasError('required')">
            Nome é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descrição</mat-label>
          <textarea 
            matInput 
            formControlName="descricao" 
            rows="3"
            placeholder="Descreva o produto...">
          </textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Preço</mat-label>
            <input 
              matInput 
              type="number" 
              step="0.01"
              formControlName="preco" 
              placeholder="0,00">
            <span matTextPrefix>R$ </span>
            <mat-error *ngIf="menuForm.get('preco')?.hasError('required')">
              Preço é obrigatório
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Categoria</mat-label>
            <mat-select formControlName="categoria">
              <mat-option value="lanche">Lanche</mat-option>
              <mat-option value="bebida">Bebida</mat-option>
              <mat-option value="sobremesa">Sobremesa</mat-option>
              <mat-option value="petisco">Petisco</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <!-- Botões -->
      <div class="form-actions">
        <button type="button" mat-button (click)="onCancel()">
          Cancelar
        </button>
        <button 
          type="submit" 
          mat-raised-button 
          color="primary"
          [disabled]="menuForm.invalid || isSubmitting">
          {{ isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar') }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .menu-form {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
      font-weight: 500;
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
    }
  `]
})
export class MenuFormComponent implements OnInit {
  @Input() menuItem?: MenuItem;

  menuForm!: FormGroup;
  isEditing = false;
  isSubmitting = false;
  currentImageUrl = '';

  private fb = inject(FormBuilder);
  private imageService = inject(ImageService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.isEditing = !!this.menuItem;
    this.initForm();
    
    if (this.menuItem) {
      this.loadMenuItemData();
    }
  }

  private initForm(): void {
    this.menuForm = this.fb.group({
      nome: ['', [Validators.required]],
      descricao: [''],
      preco: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', [Validators.required]],
      imagem: ['']
    });
  }

  private loadMenuItemData(): void {
    if (this.menuItem) {
      this.menuForm.patchValue({
        nome: this.menuItem.nome,
        descricao: this.menuItem.descricao,
        preco: this.menuItem.preco,
        categoria: this.menuItem.categoria,
        imagem: this.menuItem.imagem
      });

      if (this.menuItem.imagem) {
        this.currentImageUrl = this.imageService.getImageUrl(this.menuItem.imagem);
      }
    }
  }

  onImageUploaded(imageUrl: string): void {
    this.currentImageUrl = imageUrl;
    this.menuForm.patchValue({ imagem: imageUrl });
    
    // Se estiver editando, atualizar imagem no backend
    if (this.isEditing && this.menuItem?.id) {
      this.imageService.updateMenuItemImage(this.menuItem.id, imageUrl).subscribe({
        next: () => {
          this.snackBar.open('Imagem atualizada!', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao atualizar imagem:', error);
          this.snackBar.open('Erro ao atualizar imagem', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  onImageRemoved(): void {
    this.currentImageUrl = '';
    this.menuForm.patchValue({ imagem: '' });
    
    // Se estiver editando, remover imagem no backend
    if (this.isEditing && this.menuItem?.id) {
      this.imageService.removeMenuItemImage(this.menuItem.id).subscribe({
        next: () => {
          this.snackBar.open('Imagem removida!', 'Fechar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erro ao remover imagem:', error);
          this.snackBar.open('Erro ao remover imagem', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.menuForm.valid) {
      this.isSubmitting = true;
      const formData = this.menuForm.value;
      
      // Aqui você implementaria a lógica para salvar no backend
      console.log('Dados do formulário:', formData);
      
      // Simular envio
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open(
          `Item ${this.isEditing ? 'atualizado' : 'criado'} com sucesso!`, 
          'Fechar', 
          { duration: 3000 }
        );
      }, 1000);
    }
  }

  onCancel(): void {
    // Implementar lógica de cancelamento
    console.log('Cancelar');
  }
}