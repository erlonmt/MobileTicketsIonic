import { Injectable } from '@angular/core';
import { retry } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SenhaService {

  public senhasGeral: number = 0;
  public senhasPrior: number = 0;
  public senhasExame: number = 0;
  public senhasTotal: number = 0;

  // Arrays para armazenar as senhas emitidas por tipo
  public senhaArray: { [key: string]: string[] } = {
    SP: [],
    SE: [],
    SG: [],
  };

  public inputNovaSenha: string = '';

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
    if (tipoSenha == 'SG') {
      this.somaGeral();
      prefix = 'SG';
      key = 'SG';
    } else if (tipoSenha == 'SP') {
      this.somaPrior();
      prefix = 'SP';
      key = 'SP';
    } else if (tipoSenha == 'SE') {
      this.somaExame();
      prefix = 'SE';
      key = 'SE';
    } else {  
      return; // tipo inválido
    }

    const now = new Date();
    this.inputNovaSenha =
      new Date().getFullYear().toString().substring(2, 4) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '-' +
      prefix + (this.senhaArray[key].length + 1).toString().padStart(2, '0');

    this.senhaArray[key].push(this.inputNovaSenha);

    console.log(this.senhaArray);
  }

  private ultimoTipoChamado: 'SP' | 'SE' | 'SG' | null = null;

  chamarProximaSenha(): string | null {
  
    const filaSP = this.senhaArray['SP'];
    const filaSE = this.senhaArray['SE'];
    const filaSG = this.senhaArray['SG'];
  
    // Primeira chamada → tenta SP
    if (!this.ultimoTipoChamado) {
      if (filaSP.length > 0) {
        this.ultimoTipoChamado = 'SP';
        return filaSP.shift()!;
      }
    }
  
    // Se última foi SP → chama SE ou SG
    if (this.ultimoTipoChamado === 'SP') {
  
      if (filaSE.length > 0) {
        this.ultimoTipoChamado = 'SE';
        return filaSE.shift()!;
      }
  
      if (filaSG.length > 0) {
        this.ultimoTipoChamado = 'SG';
        return filaSG.shift()!;
      }
  
      // fallback
      if (filaSP.length > 0) {
        this.ultimoTipoChamado = 'SP';
        return filaSP.shift()!;
      }
    }
  
    // Se última foi SE ou SG → prioriza SP
    if (this.ultimoTipoChamado === 'SE' || this.ultimoTipoChamado === 'SG') {
  
      if (filaSP.length > 0) {
        this.ultimoTipoChamado = 'SP';
        return filaSP.shift()!;
      }
  
      // fallback
      if (filaSE.length > 0) {
        this.ultimoTipoChamado = 'SE';
        return filaSE.shift()!;
      }
  
      if (filaSG.length > 0) {
        this.ultimoTipoChamado = 'SG';
        return filaSG.shift()!;
      }
    }
  
    // nenhuma senha disponível
    return null;
  }
  
}