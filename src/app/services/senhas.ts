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

  public inputNovaSenha: string = '';

  public ultimasChamadas: string[] = [];

  somaGeral() {
    this.senhasGeral++;
    this.senhasTotal++;
  }

  somaPrior() {
    this.senhasPrior++;
    this.senhasTotal++;
  }

  somaExame() {
    this.senhasExame++;
    this.senhasTotal++;
  }

  novaSenha(tipoSenha: string = '') {
    let prefix = '';
    let key = '';
    if (tipoSenha === 'SG') {
      this.somaGeral();
      prefix = 'SG';
      key = 'SG';
    } else if (tipoSenha === 'SP') {
      this.somaPrior();
      prefix = 'SP';
      key = 'SP';
    } else if (tipoSenha === 'SE') {
      this.somaExame();
      prefix = 'SE';
      key = 'SE';
    } else {
      return;
    }

    const now = new Date();
    this.inputNovaSenha =
      now.getFullYear().toString().substring(2, 4) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '-' +
      prefix + (this.senhaArray[key].length + 1).toString().padStart(2, '0');

    this.senhaArray[key].push(this.inputNovaSenha);
  }

  private ultimoTipoChamado: 'SP' | 'SE' | 'SG' | null = null;

  chamarProximaSenha(): string | null {
    const filaSP = this.senhaArray['SP'];
    const filaSE = this.senhaArray['SE'];
    const filaSG = this.senhaArray['SG'];

    if (!this.ultimoTipoChamado) {
      if (filaSP.length > 0) {
        this.ultimoTipoChamado = 'SP';
        return filaSP.shift()!;
      }
      if (filaSE.length > 0) {
        this.ultimoTipoChamado = 'SE';
        return filaSE.shift()!;
      }
      if (filaSG.length > 0) {
        this.ultimoTipoChamado = 'SG';
        return filaSG.shift()!;
      }
      return null;
    }

    if (this.ultimoTipoChamado === 'SP') {
      if (filaSE.length > 0) {
        this.ultimoTipoChamado = 'SE';
        return filaSE.shift()!;
      }
      if (filaSG.length > 0) {
        this.ultimoTipoChamado = 'SG';
        return filaSG.shift()!;
      }
      if (filaSP.length > 0) {
        this.ultimoTipoChamado = 'SP';
        return filaSP.shift()!;
      }
    }

    if (this.ultimoTipoChamado === 'SE' || this.ultimoTipoChamado === 'SG') {
      if (filaSP.length > 0) {
        this.ultimoTipoChamado = 'SP';
        return filaSP.shift()!;
      }
      if (filaSE.length > 0) {
        this.ultimoTipoChamado = 'SE';
        return filaSE.shift()!;
      }
      if (filaSG.length > 0) {
        this.ultimoTipoChamado = 'SG';
        return filaSG.shift()!;
      }
    }

    return null;
  }

  chamarSenhaPainel(): string | null {
    const senha = this.chamarProximaSenha();

    if (senha) {
      const guiche = Math.floor(Math.random() * 3) + 1;
      const senhaComGuiche = `${senha} - G${guiche}`;
      this.ultimasChamadas.push(senhaComGuiche);
      if (this.ultimasChamadas.length > 5) {
        this.ultimasChamadas.shift();
      }
      return senhaComGuiche;
    }

    return null;
  }

  private randomEntre(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  gerarTempoAtendimento(tipo: 'SP' | 'SG' | 'SE'): number {
    if (tipo === 'SP') {
      return this.randomEntre(10, 20);
    }

    if (tipo === 'SG') {
      return this.randomEntre(2, 8);
    }

    if (tipo === 'SE') {
      const chance = Math.random();
      if (chance <= 0.95) {
        return 1;
      } else {
        return 5;
      }
    }

    return 0;
  }
}