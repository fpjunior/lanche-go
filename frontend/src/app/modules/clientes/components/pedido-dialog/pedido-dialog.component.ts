import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CarrinhoService } from '../../services/carrinho.service';
import { ItemCarrinho, ClienteInfo } from '../../models/menu.model';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface PedidoDialogData {
  itens: ItemCarrinho[];
  total: number;
}

@Component({
  selector: 'app-pedido-dialog',
  templateUrl: './pedido-dialog.component.html',
  styleUrls: ['./pedido-dialog.component.scss'],
  standalone: false
})
export class PedidoDialogComponent implements OnInit {
  pedidoForm: FormGroup;
  loading = false;
  etapaAtual = 1; // 1: Revisão, 2: Dados cliente, 3: Confirmação

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PedidoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PedidoDialogData,
    private carrinhoService: CarrinhoService,
    private snackBar: MatSnackBar
  ) {
    this.pedidoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      telefone: ['', [Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      mesa: [''],
      observacoesGerais: ['']
    });
  }

  ngOnInit(): void {}

  proximaEtapa(): void {
    if (this.etapaAtual < 3) {
      this.etapaAtual++;
    }
  }

  etapaAnterior(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    }
  }

  finalizarPedido(): void {
    if (this.pedidoForm.valid) {
      this.loading = true;
      
      const clienteInfo: ClienteInfo = {
        nome: this.pedidoForm.value.nome,
        telefone: this.pedidoForm.value.telefone || undefined,
        mesa: this.pedidoForm.value.mesa || undefined
      };

      this.carrinhoService.criarPedido(
        clienteInfo, 
        this.pedidoForm.value.observacoesGerais || undefined
      ).subscribe({
        next: (pedido) => {
          this.loading = false;
          this.showMessage('Pedido realizado com sucesso!');
          this.dialogRef.close({ pedidoCriado: true, pedido });
        },
        error: (error) => {
          this.loading = false;
          this.showMessage('Erro ao criar pedido. Tente novamente.');
          console.error('Erro ao criar pedido:', error);
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  atualizarQuantidade(index: number, novaQuantidade: number): void {
    this.carrinhoService.atualizarQuantidade(index, novaQuantidade);
    // Atualizar dados locais
    this.data.itens = [...this.data.itens];
    this.data.total = this.data.itens.reduce((acc, item) => acc + item.subtotal, 0);
  }

  removerItem(index: number): void {
    this.carrinhoService.removerItem(index);
    // Atualizar dados locais
    this.data.itens.splice(index, 1);
    this.data.total = this.data.itens.reduce((acc, item) => acc + item.subtotal, 0);
    
    // Fechar dialog se não houver mais itens
    if (this.data.itens.length === 0) {
      this.dialogRef.close();
    }
  }

  formatarTelefone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
      this.pedidoForm.patchValue({ telefone: value });
    }
  }
}