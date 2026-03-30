import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SenhaService {

  public senhasGeral: number = 0;
  public senhasPrior: number = 0;
  public senhasExame: number = 0;
  public senhasTotal: number = 0;

  public senhaArray: { [key: string]: string[] } = {
    SP: [],
    SE: [],
    SG: [],
  };

  public ultimasChamadas: string[] = [];
  
  public atendimentos: {
    senha: string,
    tipo: string,
    guiche: number,
    tempo: number,
    horaAtendimento: Date
  }[] = [];

  public emissoes: {
    senha: string,
    tipo: string,
    horaEmissao: Date
  }[] = [];

  public atendidosPorTipo: { [key: string]: number } = {
    SP: 0,
    SE: 0,
    SG: 0,
  };

  private ultimoTipoChamado: 'SP' | 'SE' | 'SG' | null = null;

  private somaGeral() {
    this.senhasGeral++;
    this.senhasTotal++;
  }

  private somaPrior() {
    this.senhasPrior++;
    this.senhasTotal++;
  }

  private somaExame() {
    this.senhasExame++;
    this.senhasTotal++;
  }

  novaSenha(tipoSenha: 'SP' | 'SG' | 'SE'): string {
    if (tipoSenha === 'SG') this.somaGeral();
    if (tipoSenha === 'SP') this.somaPrior();
    if (tipoSenha === 'SE') this.somaExame();

    const now = new Date();
    const prefix = tipoSenha;

    const senha =
      now.getFullYear().toString().substring(2, 4) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '-' +
      prefix +
      (this.senhaArray[tipoSenha].length + 1)
        .toString()
        .padStart(3, '0');

    this.senhaArray[tipoSenha].push(senha);

    this.emissoes.push({
      senha,
      tipo: tipoSenha,
      horaEmissao: new Date()
    });

    return senha;
  }

  chamarProximaSenha(): string | null {
    const filaSP = this.senhaArray['SP'];
    const filaSE = this.senhaArray['SE'];
    const filaSG = this.senhaArray['SG'];

    let senhaSelecionada: string | undefined;
    let tipoSelecionado: 'SP' | 'SE' | 'SG' | null = null;

    if (!this.ultimoTipoChamado) {
      if (filaSP.length > 0) {
        tipoSelecionado = 'SP';
        senhaSelecionada = filaSP.shift();
      } else if (filaSE.length > 0) {
        tipoSelecionado = 'SE';
        senhaSelecionada = filaSE.shift();
      } else if (filaSG.length > 0) {
        tipoSelecionado = 'SG';
        senhaSelecionada = filaSG.shift();
      }
    } else if (this.ultimoTipoChamado === 'SP') {
      if (filaSE.length > 0) {
        tipoSelecionado = 'SE';
        senhaSelecionada = filaSE.shift();
      } else if (filaSG.length > 0) {
        tipoSelecionado = 'SG';
        senhaSelecionada = filaSG.shift();
      } else if (filaSP.length > 0) {
        tipoSelecionado = 'SP';
        senhaSelecionada = filaSP.shift();
      }
    } else {
      if (filaSP.length > 0) {
        tipoSelecionado = 'SP';
        senhaSelecionada = filaSP.shift();
      } else if (filaSE.length > 0) {
        tipoSelecionado = 'SE';
        senhaSelecionada = filaSE.shift();
      } else if (filaSG.length > 0) {
        tipoSelecionado = 'SG';
        senhaSelecionada = filaSG.shift();
      }
    }

    if (senhaSelecionada && tipoSelecionado) {
      this.ultimoTipoChamado = tipoSelecionado;
      this.atendidosPorTipo[tipoSelecionado]++;
      return senhaSelecionada;
    }

    return null;
  }

  chamarSenhaPainel(): string | null {
    const senha = this.chamarProximaSenha();

    if (senha) {
      const tipo = senha.substring(7, 9) as 'SP' | 'SE' | 'SG';
      const guiche = Math.floor(Math.random() * 3) + 1;
      const tempo = this.gerarTempoAtendimento(tipo);

      this.atendimentos.push({
        senha,
        tipo,
        guiche,
        tempo,
        horaAtendimento: new Date()
      });

      const senhaGuiche = `${senha} - G${guiche}`;
      this.ultimasChamadas.push(senhaGuiche);

      if (this.ultimasChamadas.length > 5) {
        this.ultimasChamadas.shift();
      }

      return senhaGuiche;
    }

    return null;
  }

  private randomEntre(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  gerarTempoAtendimento(tipo: 'SP' | 'SG' | 'SE'): number {
    if (tipo === 'SP') return this.randomEntre(10, 20);
    if (tipo === 'SG') return this.randomEntre(2, 8);
    if (tipo === 'SE') return Math.random() <= 0.95 ? 1 : 5;
    return 0;
  }

  mediaTempo(tipo: string): number {
    const lista = this.atendimentos.filter(a => a.tipo === tipo);
    if (lista.length === 0) return 0;
    const soma = lista.reduce((acc, item) => acc + item.tempo, 0);
    return +(soma / lista.length).toFixed(1);
  }

  getTotalAtendidosPorTipo(tipo: 'SP' | 'SE' | 'SG'): number {
    return this.atendidosPorTipo[tipo] || 0;
  }

  getTotalAtendimentos(): number {
    return Object.values(this.atendidosPorTipo).reduce((acc, val) => acc + val, 0);
  }
}