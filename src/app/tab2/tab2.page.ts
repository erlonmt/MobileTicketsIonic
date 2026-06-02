import { Component, inject } from '@angular/core';
import { ChamadaPainel, SenhaService } from '../services/senhas';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  guiche = 1;
  senhaAtual: ChamadaPainel | null = null;
  mensagem = 'Aguardando acionamento do atendente';

  readonly senhaService = inject(SenhaService);

  chamar(): void {
    const chamada = this.senhaService.chamarSenhaPainel(this.guiche);

    if (!chamada) {
      this.senhaAtual = null;
      this.mensagem = this.senhaService.expedienteAtivo
        ? 'Nenhuma senha disponível na fila.'
        : 'Expediente encerrado. As senhas pendentes foram descartadas.';
      return;
    }

    this.senhaAtual = chamada;
    this.mensagem = `${chamada.codigo} chamada para o guichê ${chamada.guiche}`;
  }

  encerrar(): void {
    this.senhaService.encerrarExpediente();
    this.senhaAtual = null;
    this.mensagem = 'Expediente encerrado às 17:00.';
  }

  novoExpediente(): void {
    this.senhaService.iniciarNovoExpediente();
    this.senhaAtual = null;
    this.mensagem = 'Novo expediente iniciado às 07:00.';
  }
}
