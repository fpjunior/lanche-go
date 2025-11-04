import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ImageService, UploadProgress, ImageUploadResponse } from '../../services/image.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="image-upload-container">
      <!-- Input oculto para seleção de arquivo -->
      <input 
        #fileInput 
        type="file" 
        accept="image/*" 
        (change)="onFileSelected($event)"
        style="display: none"
      >

      <!-- Preview da imagem atual -->
      <div class="image-preview" *ngIf="currentImageUrl">
        <img [src]="currentImageUrl" [alt]="altText" class="preview-image">
        <div class="image-overlay">
          <button mat-icon-button (click)="selectNewImage()" class="change-btn">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button (click)="removeImage()" class="remove-btn" *ngIf="allowRemove">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>

      <!-- Área de upload vazia -->
      <div 
        class="upload-area" 
        *ngIf="!currentImageUrl"
        (click)="selectNewImage()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        [class.drag-over]="isDragOver"
      >
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <p class="upload-text">
          {{ uploadText || 'Clique ou arraste uma imagem aqui' }}
        </p>
        <p class="upload-hint">
          Formatos: JPEG, PNG, WebP • Máximo: 5MB
        </p>
      </div>

      <!-- Barra de progresso -->
      <div class="progress-container" *ngIf="uploadProgress && uploadProgress.status === 'uploading'">
        <mat-progress-bar 
          mode="determinate" 
          [value]="uploadProgress.progress"
          class="upload-progress">
        </mat-progress-bar>
        <span class="progress-text">{{ uploadProgress.progress }}%</span>
      </div>
    </div>
  `,
  styles: [`
    .image-upload-container {
      width: 100%;
      max-width: 300px;
    }

    .image-preview {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .preview-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .image-preview:hover .image-overlay {
      opacity: 1;
    }

    .change-btn, .remove-btn {
      background: rgba(255,255,255,0.9);
      color: #333;
    }

    .remove-btn {
      background: rgba(244,67,54,0.9);
      color: white;
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .upload-area:hover {
      border-color: #2196F3;
      background: #f5f5f5;
    }

    .upload-area.drag-over {
      border-color: #2196F3;
      background: #e3f2fd;
    }

    .upload-icon {
      font-size: 48px;
      color: #999;
      margin-bottom: 16px;
    }

    .upload-text {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #333;
    }

    .upload-hint {
      margin: 0;
      font-size: 12px;
      color: #666;
    }

    .progress-container {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .upload-progress {
      flex: 1;
    }

    .progress-text {
      font-size: 12px;
      color: #666;
      min-width: 35px;
    }
  `]
})
export class ImageUploadComponent {
  @Input() currentImageUrl: string = '';
  @Input() uploadText: string = '';
  @Input() altText: string = 'Imagem';
  @Input() allowRemove: boolean = true;
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isDragOver = false;
  uploadProgress: UploadProgress | null = null;

  constructor(
    private imageService: ImageService,
    private snackBar: MatSnackBar
  ) {
    // Observar progresso de upload
    this.imageService.uploadProgress$.subscribe((progress: UploadProgress | null) => {
      this.uploadProgress = progress;
    });
  }

  selectNewImage(): void {
    this.fileInput.nativeElement.click();
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
    // Validar arquivo
    const validation = this.imageService.validateImageFile(file);
    if (!validation.valid) {
      this.snackBar.open(validation.error!, 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Fazer upload
    this.imageService.uploadMenuImage(file).subscribe({
      next: (response: ImageUploadResponse | null) => {
        if (response) {
          this.snackBar.open('Imagem enviada com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.imageUploaded.emit(response.data.url);
        }
      },
      error: (error: any) => {
        console.error('Erro no upload:', error);
        this.snackBar.open('Erro ao enviar imagem', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.imageService.reportUploadError('Erro ao enviar imagem');
      }
    });
  }

  removeImage(): void {
    this.imageRemoved.emit();
    this.imageService.resetUploadProgress();
  }
}